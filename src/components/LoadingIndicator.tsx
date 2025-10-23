/**
 * LoadingIndicator Component
 * Displays a loading spinner with optional message
 * iOS-styled activity indicator for consistent user experience
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

/**
 * Props for LoadingIndicator component
 */
interface LoadingIndicatorProps {
  /** Optional message to display below the spinner */
  message?: string;
}

/**
 * Loading indicator component with iOS styling
 *
 * Usage:
 * ```tsx
 * <LoadingIndicator />
 * <LoadingIndicator message="Loading contacts..." />
 * ```
 */
export function LoadingIndicator({ message }: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
