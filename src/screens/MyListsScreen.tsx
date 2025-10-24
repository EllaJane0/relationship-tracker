/**
 * MyListsScreen
 * Displays all lists created by the authenticated user
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { useAuth } from '../contexts/AuthContext';
import * as listService from '../services/listService';
import type { ListSummary } from '../types/list-models';
import type { MainStackParamList } from '../types/navigation';
import { theme } from '../styles/theme';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';

export function MyListsScreen() {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { user } = useAuth();
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's lists
  const fetchLists = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userLists = await listService.getUserLists(user.id);
      setLists(userLists);
    } catch (err: any) {
      setError(err.message || 'Failed to load lists');
      console.error('Error fetching lists:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchLists();
  };

  // Handle delete list
  const handleDelete = (listId: string, title: string) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await listService.deleteList(listId);
              setLists(prev => prev.filter(list => list.id !== listId));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete list');
            }
          },
        },
      ]
    );
  };

  // Render individual list item
  const renderListItem = ({ item }: { item: ListSummary }) => {
    const createdDate = new Date(item.createdAt).toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() => navigation.navigate('EditList', { listId: item.id })}
      >
        <View style={styles.listCardContent}>
          <View style={styles.listInfo}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listMeta}>
              {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'} • Created {createdDate}
            </Text>
          </View>
          <TouchableOpacity
            onPress={(e) => {
              if (e && e.stopPropagation) {
                e.stopPropagation();
              }
              handleDelete(item.id, item.title);
            }}
            onPressIn={(e) => {
              if (e && e.stopPropagation) {
                e.stopPropagation();
              }
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>You haven't created any lists yet</Text>
      <Text style={styles.emptyMessage}>
        Create your first Christmas list to get started
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('CreateList')}
      >
        <Text style={styles.primaryButtonText}>Create Your First List</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && lists.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <ErrorMessage message={error} />}

      <FlatList
        data={lists}
        renderItem={renderListItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContainer,
          lists.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  listContainerEmpty: {
    flexGrow: 1,
  },
  listCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  listCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xs,
  },
  listMeta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.headline,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  emptyMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xl,
  },
  primaryButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
