/**
 * EditListScreen
 * Screen for adding and editing items in a Christmas list
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { useList } from '../hooks/useList';
import type { MainStackParamList } from '../types/navigation';
import type { ListItem } from '../types/list-models';
import { theme } from '../styles/theme';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';

type EditListScreenRouteProp = RouteProp<MainStackParamList, 'EditList'>;

export function EditListScreen() {
  const route = useRoute<EditListScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { listId } = route.params;

  const {
    list,
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    generateShareLink,
  } = useList(listId);

  const [urlInput, setUrlInput] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [showShareLink, setShowShareLink] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const updateTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Handle adding an item
  const handleAddItem = async () => {
    if (!urlInput.trim()) {
      Alert.alert('Error', 'Please enter a product URL');
      return;
    }

    setAddingItem(true);
    try {
      await addItem(urlInput.trim());
      setUrlInput('');
      Alert.alert('Success', 'Item added! We\'re fetching product details...');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  // Handle generating share link
  const handleGenerateShareLink = async () => {
    try {
      const link = await generateShareLink();
      setShareLink(link);
      setShowShareLink(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate share link');
    }
  };

  // Handle copying share link
  const handleCopyLink = () => {
    // In a real app, use Clipboard API
    Alert.alert('Link Copied!', shareLink);
  };

  // Handle deleting an item
  const handleDeleteItem = (itemId: string, title: string | null) => {
    console.log('Delete item clicked:', itemId, title);

    // Use window.confirm for web compatibility
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Remove "${title || 'this item'}" from your list?`);
      if (confirmed) {
        deleteItem(itemId).catch(err => {
          alert(err.message || 'Failed to delete item');
        });
      }
    } else {
      Alert.alert(
        'Delete Item',
        `Remove "${title || 'this item'}" from your list?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteItem(itemId);
              } catch (err: any) {
                Alert.alert('Error', err.message || 'Failed to delete item');
              }
            },
          },
        ]
      );
    }
  };

  // Handle updating item notes/details with debouncing
  const handleUpdateNotes = useCallback((itemId: string, notes: string) => {
    // Update local state immediately for smooth typing
    setLocalNotes(prev => ({ ...prev, [itemId]: notes }));

    // Clear existing timeout for this item
    if (updateTimeoutRef.current[itemId]) {
      clearTimeout(updateTimeoutRef.current[itemId]);
    }

    // Set new timeout to update database
    updateTimeoutRef.current[itemId] = setTimeout(async () => {
      try {
        await updateItem(itemId, { notes });
      } catch (err: any) {
        console.error('Failed to update notes:', err);
      }
    }, 500); // Wait 500ms after user stops typing
  }, [updateItem]);

  // Handle updating item (non-notes fields)
  const handleUpdateItem = async (itemId: string, updates: Partial<ListItem>) => {
    try {
      await updateItem(itemId, updates);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update item');
    }
  };

  // Render individual item card
  const renderItem = (item: ListItem) => {
    const isEditing = editingItemId === item.id;

    return (
      <View key={item.id} style={styles.itemCard}>
        {/* Item Details */}
        <View style={styles.itemDetails}>
          {/* Title */}
          {item.title ? (
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
          ) : (
            <Text style={styles.itemTitlePlaceholder}>Loading product details...</Text>
          )}

          {/* Product Link - Clickable */}
          <TouchableOpacity
            onPress={() => Linking.openURL(item.url)}
            activeOpacity={0.7}
          >
            <Text style={styles.itemUrl} numberOfLines={1}>
              {item.url}
            </Text>
          </TouchableOpacity>

          {/* Notes Input */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes (color, size, etc.):</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g., Blue, Size M, or any specific preferences"
              placeholderTextColor={theme.colors.textSecondary}
              value={localNotes[item.id] !== undefined ? localNotes[item.id] : (item.notes || '')}
              onChangeText={(text) => handleUpdateNotes(item.id, text)}
              multiline
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteItem(item.id, item.title)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.listTitle}>{list?.title || 'My List'}</Text>
            <Text style={styles.itemCount}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {error && <ErrorMessage message={error} />}

          {/* Add Item Section */}
          <View style={styles.addItemSection}>
            <Text style={styles.sectionTitle}>Add Item by URL</Text>
            <Text style={styles.sectionSubtitle}>
              Paste a link to any product from Amazon, Etsy, Target, etc.
            </Text>

            <View style={styles.urlInputContainer}>
              <TextInput
                style={styles.urlInput}
                placeholder="https://www.amazon.com/product..."
                placeholderTextColor={theme.colors.textSecondary}
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                style={[styles.addButton, addingItem && styles.addButtonDisabled]}
                onPress={handleAddItem}
                disabled={addingItem}
              >
                {addingItem ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Items List */}
          {items.length > 0 ? (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Your Items</Text>
              {items.map(renderItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No items yet</Text>
              <Text style={styles.emptyMessage}>
                Add items by pasting product links above
              </Text>
            </View>
          )}

          {/* Share Link Section */}
          {items.length > 0 && (
            <View style={styles.shareSection}>
              <TouchableOpacity
                style={styles.generateLinkButton}
                onPress={handleGenerateShareLink}
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                <Text style={styles.generateLinkButtonText}>
                  {showShareLink ? 'Regenerate Share Link' : 'Generate Share Link'}
                </Text>
              </TouchableOpacity>

              {showShareLink && shareLink && (
                <View style={styles.shareLinkContainer}>
                  <Text style={styles.shareLinkLabel}>Share this link:</Text>
                  <View style={styles.shareLinkBox}>
                    <Text style={styles.shareLinkText} numberOfLines={1}>
                      {shareLink}
                    </Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={handleCopyLink}
                    >
                      <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  listTitle: {
    ...theme.typography.title,
    fontSize: 28,
    marginBottom: theme.spacing.xs,
  },
  itemCount: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  addItemSection: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  sectionTitle: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  urlInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  urlInput: {
    flex: 1,
    ...theme.typography.body,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  itemsSection: {
    marginBottom: theme.spacing.lg,
  },
  itemCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    ...theme.typography.headline,
    marginBottom: theme.spacing.xs,
  },
  itemTitlePlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  itemUrl: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textDecorationLine: 'underline',
  },
  notesContainer: {
    marginBottom: theme.spacing.md,
  },
  notesLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  notesInput: {
    ...theme.typography.body,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    minHeight: 60,
  },
  itemActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionButtonText: {
    ...theme.typography.body,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    ...theme.typography.headline,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  emptyMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  shareSection: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  generateLinkButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  generateLinkButtonText: {
    ...theme.typography.headline,
    color: '#FFFFFF',
  },
  shareLinkContainer: {
    marginTop: theme.spacing.md,
  },
  shareLinkLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  shareLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  shareLinkText: {
    ...theme.typography.body,
    flex: 1,
    color: theme.colors.primary,
  },
  copyButton: {
    padding: theme.spacing.xs,
  },
});
