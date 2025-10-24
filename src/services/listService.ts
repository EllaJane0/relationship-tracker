/**
 * List Service
 * Handles all database operations for Christmas lists, list items, and saved lists
 */

import { supabase } from '../lib/supabase';
import type {
  List,
  ListItem,
  ListSummary,
  SavedListSummary,
  SharedList,
  ListRow,
  ListItemRow,
  SavedListRow,
  CreateListItemInput,
  UpdateListItemInput,
} from '../types/list-models';

/**
 * Generate a cryptographically random share token
 * @returns 32-character random string
 */
function generateShareToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  const array = new Uint8Array(32);

  // Use crypto.getRandomValues for secure random generation
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
    for (let i = 0; i < 32; i++) {
      token += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 32; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return token;
}

/**
 * Convert database row to List model (camelCase)
 */
function rowToList(row: ListRow): List {
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    shareToken: row.share_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert database row to ListItem model (camelCase)
 */
function rowToListItem(row: ListItemRow): ListItem {
  return {
    id: row.id,
    listId: row.list_id,
    url: row.url,
    title: row.title,
    imageUrl: row.image_url,
    price: row.price,
    notes: row.notes,
    position: row.position,
    createdAt: row.created_at,
  };
}

// ============================================================================
// LIST OPERATIONS
// ============================================================================

/**
 * Create a new list
 * @param userId - ID of the user creating the list
 * @param title - Title of the list
 * @returns The created list
 */
export async function createList(userId: string, title: string): Promise<List> {
  const shareToken = generateShareToken();

  const { data, error } = await supabase
    .from('lists')
    .insert({
      creator_id: userId,
      title,
      share_token: shareToken,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create list: ${error.message}`);
  }

  return rowToList(data as ListRow);
}

/**
 * Get all lists created by a user
 * @param userId - ID of the user
 * @returns Array of list summaries
 */
export async function getUserLists(userId: string): Promise<ListSummary[]> {
  const { data, error } = await supabase
    .from('lists')
    .select(`
      id,
      title,
      share_token,
      created_at,
      list_items (count)
    `)
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user lists: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    shareToken: row.share_token,
    createdAt: row.created_at,
    itemCount: row.list_items?.[0]?.count || 0,
  }));
}

/**
 * Get a list by ID with all items
 * @param listId - ID of the list
 * @returns List with items or null if not found
 */
export async function getListById(listId: string): Promise<(List & { items: ListItem[] }) | null> {
  const { data: listData, error: listError } = await supabase
    .from('lists')
    .select('*')
    .eq('id', listId)
    .single();

  if (listError || !listData) {
    return null;
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', listId)
    .order('position', { ascending: true });

  if (itemsError) {
    throw new Error(`Failed to fetch list items: ${itemsError.message}`);
  }

  const list = rowToList(listData as ListRow);
  const items = (itemsData || []).map((row) => rowToListItem(row as ListItemRow));

  return {
    ...list,
    items,
  };
}

/**
 * Get a list by share token (for public viewing)
 * @param shareToken - Share token of the list
 * @returns Shared list with creator info and items, or null if not found
 */
export async function getListByShareToken(shareToken: string): Promise<SharedList | null> {
  const { data: listData, error: listError } = await supabase
    .from('lists')
    .select(`
      id,
      title,
      creator_id
    `)
    .eq('share_token', shareToken)
    .single();

  if (listError || !listData) {
    return null;
  }

  // Get creator email/name from auth metadata
  // Note: We can't directly query auth.users, so we'll use a placeholder
  const creatorName = 'User';

  // Get list items
  const { data: itemsData, error: itemsError } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', listData.id)
    .order('position', { ascending: true });

  if (itemsError) {
    throw new Error(`Failed to fetch list items: ${itemsError.message}`);
  }

  const items = (itemsData || []).map((row) => rowToListItem(row as ListItemRow));

  return {
    id: listData.id,
    title: listData.title,
    creatorName,
    items,
  };
}

/**
 * Update a list's title
 * @param listId - ID of the list
 * @param title - New title
 */
export async function updateListTitle(listId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('lists')
    .update({ title })
    .eq('id', listId);

  if (error) {
    throw new Error(`Failed to update list title: ${error.message}`);
  }
}

/**
 * Delete a list (cascades to items and saved_lists)
 * @param listId - ID of the list to delete
 */
export async function deleteList(listId: string): Promise<void> {
  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId);

  if (error) {
    throw new Error(`Failed to delete list: ${error.message}`);
  }
}

// ============================================================================
// LIST ITEM OPERATIONS
// ============================================================================

/**
 * Add an item to a list
 * @param listId - ID of the list
 * @param url - URL of the product
 * @returns The created list item
 */
export async function addItem(listId: string, url: string): Promise<ListItem> {
  // Get the max position for this list
  const { data: maxData } = await supabase
    .from('list_items')
    .select('position')
    .eq('list_id', listId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const nextPosition = maxData ? maxData.position + 1 : 0;

  const { data, error } = await supabase
    .from('list_items')
    .insert({
      list_id: listId,
      url,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add item: ${error.message}`);
  }

  return rowToListItem(data as ListItemRow);
}

/**
 * Update a list item
 * @param itemId - ID of the item
 * @param updates - Partial updates to apply
 */
export async function updateItem(itemId: string, updates: UpdateListItemInput): Promise<void> {
  // Convert camelCase to snake_case for database
  const dbUpdates: any = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.position !== undefined) dbUpdates.position = updates.position;

  const { error } = await supabase
    .from('list_items')
    .update(dbUpdates)
    .eq('id', itemId);

  if (error) {
    throw new Error(`Failed to update item: ${error.message}`);
  }
}

/**
 * Delete a list item
 * @param itemId - ID of the item to delete
 */
export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    throw new Error(`Failed to delete item: ${error.message}`);
  }
}

/**
 * Reorder list items
 * @param listId - ID of the list
 * @param itemIds - Array of item IDs in new order
 */
export async function reorderItems(listId: string, itemIds: string[]): Promise<void> {
  // Update each item's position
  const updates = itemIds.map((itemId, index) => ({
    id: itemId,
    position: index,
  }));

  for (const update of updates) {
    await updateItem(update.id, { position: update.position });
  }
}

/**
 * Get all items for a list
 * @param listId - ID of the list
 * @returns Array of list items
 */
export async function getListItems(listId: string): Promise<ListItem[]> {
  const { data, error } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', listId)
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch list items: ${error.message}`);
  }

  return (data || []).map((row) => rowToListItem(row as ListItemRow));
}

// ============================================================================
// SHARING OPERATIONS
// ============================================================================

/**
 * Generate a new share token for a list
 * @param listId - ID of the list
 * @returns The new share token
 */
export async function generateShareTokenForList(listId: string): Promise<string> {
  const shareToken = generateShareToken();

  const { error } = await supabase
    .from('lists')
    .update({ share_token: shareToken })
    .eq('id', listId);

  if (error) {
    throw new Error(`Failed to generate share token: ${error.message}`);
  }

  return shareToken;
}

// ============================================================================
// SAVED LISTS OPERATIONS
// ============================================================================

/**
 * Save a list to user's dashboard
 * @param userId - ID of the user
 * @param listId - ID of the list to save
 */
export async function saveList(userId: string, listId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_lists')
    .insert({
      user_id: userId,
      list_id: listId,
    });

  if (error) {
    // Ignore duplicate key errors (already saved)
    if (error.code !== '23505') {
      throw new Error(`Failed to save list: ${error.message}`);
    }
  }
}

/**
 * Remove a list from user's dashboard
 * @param userId - ID of the user
 * @param listId - ID of the list to unsave
 */
export async function unsaveList(userId: string, listId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_lists')
    .delete()
    .eq('user_id', userId)
    .eq('list_id', listId);

  if (error) {
    throw new Error(`Failed to unsave list: ${error.message}`);
  }
}

/**
 * Get all lists saved by a user
 * @param userId - ID of the user
 * @returns Array of saved list summaries
 */
export async function getSavedLists(userId: string): Promise<SavedListSummary[]> {
  const { data, error } = await supabase
    .from('saved_lists')
    .select(`
      saved_at,
      list_id,
      lists (
        id,
        title,
        share_token,
        creator_id
      )
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch saved lists: ${error.message}`);
  }

  // Fetch item counts and creator info for each list
  const results: SavedListSummary[] = [];

  for (const row of data || []) {
    const list = row.lists as any;

    // Get item count
    const { count } = await supabase
      .from('list_items')
      .select('*', { count: 'exact', head: true })
      .eq('list_id', list.id);

    // Use placeholder for creator name (can't query auth.users directly)
    const creatorName = 'User';

    results.push({
      id: list.id,
      title: list.title,
      shareToken: list.share_token,
      creatorName,
      itemCount: count || 0,
      savedAt: row.saved_at,
    });
  }

  return results;
}

/**
 * Check if a list is saved by a user
 * @param userId - ID of the user
 * @param listId - ID of the list
 * @returns True if the list is saved, false otherwise
 */
export async function isListSaved(userId: string, listId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('saved_lists')
    .select('id')
    .eq('user_id', userId)
    .eq('list_id', listId)
    .single();

  return !!data && !error;
}
