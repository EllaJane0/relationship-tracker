/**
 * DashboardScreen
 * Displays all lists saved by the user from others
 */

import React from 'react';
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

import { useSavedLists } from '../hooks/useSavedLists';
import type { SavedListSummary } from '../types/list-models';
import type { RootNavigatorParamList } from '../types/navigation';
import { theme } from '../styles/theme';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';

export function DashboardScreen() {
  const navigation = useNavigation<NavigationProp<RootNavigatorParamList>>();
  const { savedLists, loading, error, unsaveList, refresh } = useSavedLists();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleUnsave = (listId: string, title: string) => {
    Alert.alert(
      'Remove List',
      `Remove "${title}" from your dashboard?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await unsaveList(listId);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove list');
            }
          },
        },
      ]
    );
  };

  const renderListItem = ({ item }: { item: SavedListSummary }) => {
    const savedDate = new Date(item.savedAt).toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() => {
          // Navigate to SharedListView screen (simplified for now)
          navigation.navigate('SharedListView' as any, { shareToken: item.shareToken });
        }}
      >
        <View style={styles.listCardContent}>
          <View style={styles.listInfo}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.creatorName}>by {item.creatorName}</Text>
            <Text style={styles.listMeta}>
              {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'} • Saved {savedDate}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleUnsave(item.id, item.title)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="albums-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No saved lists yet</Text>
      <Text style={styles.emptyMessage}>
        When someone shares a list with you, you can save it here for easy access
      </Text>
    </View>
  );

  if (loading && savedLists.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {error && <ErrorMessage message={error} />}

      <FlatList
        data={savedLists}
        renderItem={renderListItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContainer,
          savedLists.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.title,
    fontSize: 28,
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
  creatorName: {
    ...theme.typography.body,
    color: theme.colors.primary,
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
});
