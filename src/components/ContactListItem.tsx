/**
 * ContactListItem Component
 * Renders a single contact in the contact list
 * Displays name, phone number, and last contacted date placeholder
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Contact } from '../types/models';
import { theme } from '../styles/theme';

/**
 * Props for ContactListItem component
 */
interface ContactListItemProps {
  /** The contact object to display */
  contact: Contact;

  /** Last contacted date (optional, for future use) */
  lastContacted?: Date | null;

  /** Optional callback when contact is pressed */
  onPress?: () => void;
}

/**
 * Contact list item component with iOS-optimized styling
 * Displays contact information in a clean, readable format
 *
 * Usage:
 * ```tsx
 * <ContactListItem
 *   contact={contact}
 *   lastContacted={new Date()}
 * />
 * ```
 */
export const ContactListItem = React.memo(function ContactListItem({
  contact,
  lastContacted,
  onPress,
}: ContactListItemProps) {
  // Get the first phone number if available
  const phoneNumber = contact.phoneNumbers?.[0]?.number || 'No phone number';

  // Format last contacted date (placeholder for now)
  const lastContactedText = lastContacted
    ? lastContacted.toLocaleDateString()
    : 'Never contacted';

  // Render the contact item content
  const content = (
    <>
      <View style={styles.leftSection}>
        {/* Contact initials circle */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Contact info */}
        <View style={styles.infoSection}>
          <Text style={styles.name} numberOfLines={1}>
            {contact.name}
          </Text>
          <Text style={styles.phone} numberOfLines={1}>
            {phoneNumber}
          </Text>
        </View>
      </View>

      {/* Last contacted info */}
      <View style={styles.rightSection}>
        <Text style={styles.lastContactedLabel}>Last contacted</Text>
        <Text style={styles.lastContactedDate}>{lastContactedText}</Text>
      </View>
    </>
  );

  // Wrap in TouchableOpacity if onPress is provided, otherwise use View
  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    minHeight: 70,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    ...theme.typography.headline,
    color: theme.colors.background,
    fontWeight: '600',
  },
  infoSection: {
    flex: 1,
  },
  name: {
    ...theme.typography.headline,
    color: theme.colors.text,
    marginBottom: 2,
  },
  phone: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  lastContactedLabel: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    marginBottom: 2,
  },
  lastContactedDate: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    fontWeight: '600',
  },
});
