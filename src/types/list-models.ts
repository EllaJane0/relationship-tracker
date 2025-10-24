/**
 * TypeScript type definitions for Christmas List Sharing feature
 * These interfaces define the data models for lists, list items, and saved lists
 */

/**
 * List - Represents a Christmas list created by a user
 */
export interface List {
  id: string;
  creatorId: string;
  title: string;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ListItem - Represents an individual item in a Christmas list
 */
export interface ListItem {
  id: string;
  listId: string;
  url: string;
  title: string | null;
  imageUrl: string | null;
  price: number | null;
  notes: string | null;
  position: number;
  createdAt: string;
}

/**
 * ListSummary - Summary view of a list for displaying in lists
 * Used in MyListsScreen to show user's created lists
 */
export interface ListSummary {
  id: string;
  title: string;
  itemCount: number;
  createdAt: string;
  shareToken: string;
}

/**
 * SavedListSummary - Summary view of a saved list for dashboard
 * Used in DashboardScreen to show lists saved by the user
 */
export interface SavedListSummary {
  id: string;
  title: string;
  creatorName: string;
  itemCount: number;
  savedAt: string;
  shareToken: string;
}

/**
 * SharedList - Full list data for public viewing via share token
 * Used in SharedListViewScreen
 */
export interface SharedList {
  id: string;
  title: string;
  creatorName: string;
  items: ListItem[];
}

/**
 * ProductMetadata - Metadata extracted from product URLs
 * Returned by metadata extraction service
 */
export interface ProductMetadata {
  title: string | null;
  imageUrl: string | null;
  price: number | null;
  description: string | null;
  success: boolean;
}

/**
 * Database row types (snake_case from Supabase)
 * These match the actual database schema
 */

export interface ListRow {
  id: string;
  creator_id: string;
  title: string;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface ListItemRow {
  id: string;
  list_id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  price: number | null;
  notes: string | null;
  position: number;
  created_at: string;
}

export interface SavedListRow {
  id: string;
  user_id: string;
  list_id: string;
  saved_at: string;
}

/**
 * Helper type for creating new lists (without generated fields)
 */
export type CreateListInput = {
  title: string;
};

/**
 * Helper type for creating new list items (without generated fields)
 */
export type CreateListItemInput = {
  listId: string;
  url: string;
  title?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  notes?: string | null;
  position: number;
};

/**
 * Helper type for updating list items (partial updates)
 */
export type UpdateListItemInput = Partial<{
  title: string | null;
  imageUrl: string | null;
  price: number | null;
  notes: string | null;
  position: number;
}>;
