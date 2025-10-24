/**
 * useSavedLists Hook
 * Custom hook for managing saved lists in the user's dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as listService from '../services/listService';
import type { SavedListSummary } from '../types/list-models';

interface UseSavedListsReturn {
  savedLists: SavedListSummary[];
  loading: boolean;
  error: string | null;
  saveList: (listId: string) => Promise<void>;
  unsaveList: (listId: string) => Promise<void>;
  isListSaved: (listId: string) => boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing the user's saved lists
 */
export function useSavedLists(): UseSavedListsReturn {
  const { user } = useAuth();
  const [savedLists, setSavedLists] = useState<SavedListSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved lists
  const fetchSavedLists = useCallback(async () => {
    if (!user) {
      setSavedLists([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lists = await listService.getSavedLists(user.id);
      setSavedLists(lists);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved lists');
      console.error('Error fetching saved lists:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load saved lists when user is authenticated
  useEffect(() => {
    if (user) {
      fetchSavedLists();
    } else {
      setSavedLists([]);
    }
  }, [user, fetchSavedLists]);

  // Save a list
  const saveList = async (listId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      await listService.saveList(user.id, listId);
      // Refresh to get updated list
      await fetchSavedLists();
    } catch (err: any) {
      setError(err.message || 'Failed to save list');
      throw err;
    }
  };

  // Unsave a list
  const unsaveList = async (listId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      // Optimistically update local state
      setSavedLists(prev => prev.filter(list => list.id !== listId));

      await listService.unsaveList(user.id, listId);
    } catch (err: any) {
      setError(err.message || 'Failed to unsave list');
      // Refresh to get correct state on error
      await fetchSavedLists();
      throw err;
    }
  };

  // Check if a list is saved
  const isListSaved = (listId: string): boolean => {
    return savedLists.some(list => list.id === listId);
  };

  // Refresh saved lists
  const refresh = async (): Promise<void> => {
    await fetchSavedLists();
  };

  return {
    savedLists,
    loading,
    error,
    saveList,
    unsaveList,
    isListSaved,
    refresh,
  };
}
