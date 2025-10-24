/**
 * useList Hook
 * Custom hook for managing Christmas lists and their items
 */

import { useState, useEffect, useCallback } from 'react';
import * as listService from '../services/listService';
import * as metadataService from '../services/metadataService';
import type { List, ListItem } from '../types/list-models';

interface UseListReturn {
  list: (List & { items: ListItem[] }) | null;
  items: ListItem[];
  loading: boolean;
  error: string | null;

  createList: (title: string) => Promise<string>;
  updateTitle: (title: string) => Promise<void>;
  deleteList: () => Promise<void>;

  addItem: (url: string) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<ListItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  reorderItems: (itemIds: string[]) => Promise<void>;

  generateShareLink: () => Promise<string>;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing a single list
 * @param listId - Optional list ID to load. If not provided, only createList will be available.
 */
export function useList(listId?: string): UseListReturn {
  const [list, setList] = useState<(List & { items: ListItem[] }) | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch list and items
  const fetchList = useCallback(async () => {
    if (!listId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await listService.getListById(listId);
      if (data) {
        setList(data);
        setItems(data.items);
      } else {
        setError('List not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load list');
      console.error('Error fetching list:', err);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  // Load list on mount and when listId changes
  useEffect(() => {
    if (listId) {
      fetchList();
    }
  }, [listId, fetchList]);

  // Create a new list
  const createList = async (title: string): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Get current user ID from auth context would be better,
      // but for now we'll need to pass it from the calling component
      // This is a placeholder - actual implementation should get userId from useAuth
      const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());

      if (!user) {
        throw new Error('User not authenticated');
      }

      const newList = await listService.createList(user.id, title);
      return newList.id;
    } catch (err: any) {
      setError(err.message || 'Failed to create list');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update list title
  const updateTitle = async (title: string): Promise<void> => {
    if (!listId) return;

    setLoading(true);
    setError(null);

    try {
      await listService.updateListTitle(listId, title);
      if (list) {
        setList({ ...list, title });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update title');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete the list
  const deleteList = async (): Promise<void> => {
    if (!listId) return;

    setLoading(true);
    setError(null);

    try {
      await listService.deleteList(listId);
      setList(null);
      setItems([]);
    } catch (err: any) {
      setError(err.message || 'Failed to delete list');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add item to list
  const addItem = async (url: string): Promise<void> => {
    if (!listId) return;

    // Validate URL
    if (!metadataService.isValidUrl(url)) {
      setError('Invalid URL');
      throw new Error('Invalid URL');
    }

    setError(null);

    try {
      // Add item to database (optimistic update)
      const newItem = await listService.addItem(listId, url);
      setItems(prev => [...prev, newItem]);

      // Fetch metadata in background (non-blocking)
      metadataService.extractMetadata(url).then(async (metadata) => {
        if (metadata.success) {
          // Update item with metadata
          await listService.updateItem(newItem.id, {
            title: metadata.title,
            imageUrl: metadata.imageUrl,
            price: metadata.price,
            notes: metadata.description,
          });

          // Update local state
          setItems(prev =>
            prev.map(item =>
              item.id === newItem.id
                ? {
                    ...item,
                    title: metadata.title,
                    imageUrl: metadata.imageUrl,
                    price: metadata.price,
                    notes: metadata.description,
                  }
                : item
            )
          );
        }
      }).catch(err => {
        console.warn('Failed to fetch metadata:', err);
        // Don't throw - metadata extraction is optional
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
      throw err;
    }
  };

  // Update an item
  const updateItem = async (
    itemId: string,
    updates: Partial<ListItem>
  ): Promise<void> => {
    setError(null);

    try {
      await listService.updateItem(itemId, updates);

      // Optimistically update local state
      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
      // Refresh to get correct state
      await fetchList();
      throw err;
    }
  };

  // Delete an item
  const deleteItem = async (itemId: string): Promise<void> => {
    setError(null);

    try {
      await listService.deleteItem(itemId);

      // Optimistically update local state
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      // Refresh to get correct state
      await fetchList();
      throw err;
    }
  };

  // Reorder items
  const reorderItems = async (itemIds: string[]): Promise<void> => {
    if (!listId) return;

    setError(null);

    const originalItems = [...items];

    try {
      // Optimistically update local state
      const reordered = itemIds
        .map(id => items.find(item => item.id === id))
        .filter(Boolean) as ListItem[];
      setItems(reordered);

      await listService.reorderItems(listId, itemIds);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder items');
      // Rollback on error
      setItems(originalItems);
      throw err;
    }
  };

  // Generate share link
  const generateShareLink = async (): Promise<string> => {
    if (!listId || !list) {
      throw new Error('No list loaded');
    }

    setError(null);

    try {
      const shareToken = list.shareToken || await listService.generateShareTokenForList(listId);

      // Get app URL from environment or use current location
      const appUrl = process.env.EXPO_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081');

      return `${appUrl}/list/${shareToken}`;
    } catch (err: any) {
      setError(err.message || 'Failed to generate share link');
      throw err;
    }
  };

  // Refresh list data
  const refresh = async (): Promise<void> => {
    await fetchList();
  };

  return {
    list,
    items,
    loading,
    error,
    createList,
    updateTitle,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    generateShareLink,
    refresh,
  };
}
