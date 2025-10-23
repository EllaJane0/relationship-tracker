/**
 * ContactsScreen Component
 * Main screen for viewing and managing contacts
 * Handles permissions, loading states, and contact list display
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NavigationProp } from '@react-navigation/native';
import { RootTabParamList } from '../types/navigation';
import { Contact, PermissionStatus } from '../types/models';
import { theme } from '../styles/theme';
import { useContacts } from '../hooks/useContacts';
import { useDatabase } from '../hooks/useDatabase';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';
import { ContactListItem } from '../components/ContactListItem';

/**
 * Props for ContactsScreen component
 */
interface ContactsScreenProps {
  navigation: NavigationProp<RootTabParamList, 'Contacts'>;
}

/**
 * Contacts screen component
 * Displays device contacts with interaction tracking
 *
 * Features:
 * - Permission request handling
 * - Contact list with search (future)
 * - Last contacted date display
 * - Pull to refresh (future)
 */
export function ContactsScreen({ navigation }: ContactsScreenProps) {
  // Initialize database hook
  const { db, initialized: dbInitialized, error: dbError } = useDatabase();

  // Initialize contacts hook
  const {
    contacts,
    loading,
    error,
    requestPermission,
    permissionStatus,
  } = useContacts();

  /**
   * Render permission request UI
   * Shown when permission is not granted
   */
  const renderPermissionRequest = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.permissionIcon}>📱</Text>
      <Text style={styles.permissionTitle}>Contact Access Needed</Text>
      <Text style={styles.permissionText}>
        To help you track interactions with your contacts, we need access to
        your contact list.
      </Text>
      <Text style={styles.permissionNote}>
        Your contact information stays private on your device.
      </Text>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={requestPermission}
        activeOpacity={0.7}
      >
        <Text style={styles.permissionButtonText}>Allow Access</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render empty state
   * Shown when contact list is empty
   */
  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>No Contacts Found</Text>
      <Text style={styles.emptyText}>
        It looks like you don't have any contacts on your device yet.
      </Text>
    </View>
  );

  /**
   * Render a single contact item
   */
  const renderContactItem = ({ item }: { item: Contact }) => (
    <ContactListItem
      contact={item}
      lastContacted={null} // Will be populated when we implement interaction tracking
    />
  );

  /**
   * Key extractor for FlatList
   */
  const keyExtractor = (item: Contact) => item.id;

  // Show database error if initialization failed (except on web where it's expected)
  if (dbError && Platform.OS !== 'web') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ErrorMessage message={`Database Error: ${dbError}`} />
      </SafeAreaView>
    );
  }

  // Show loading indicator while loading
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingIndicator message="Loading contacts..." />
      </SafeAreaView>
    );
  }

  // Show error message if there was an error
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ErrorMessage message={error} onRetry={requestPermission} />
      </SafeAreaView>
    );
  }

  // Show permission request if permission not granted
  if (permissionStatus !== PermissionStatus.GRANTED) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {renderPermissionRequest()}
      </SafeAreaView>
    );
  }

  // Main contacts list view
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Contacts</Text>
          <Text style={styles.subtitle}>
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
          </Text>
        </View>

        {/* Contact List */}
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={
            contacts.length === 0 ? styles.emptyListContent : undefined
          }
          // Performance optimizations
          windowSize={10}
          maxToRenderPerBatch={20}
          removeClippedSubviews={true}
          initialNumToRender={20}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.xs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  // Permission request styles
  permissionIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  permissionTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  permissionText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  permissionNote: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: theme.spacing.xl,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  permissionButtonText: {
    ...theme.typography.headline,
    color: theme.colors.background,
  },
  // Empty state styles
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
  emptyListContent: {
    flex: 1,
  },
});
