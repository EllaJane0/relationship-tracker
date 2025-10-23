/**
 * ErrorMessage Component
 * Displays user-friendly error messages with optional retry button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

/**
 * Props for ErrorMessage component
 */
interface ErrorMessageProps {
  /** The error message to display */
  message: string;

  /** Optional callback function for retry button */
  onRetry?: () => void;
}

/**
 * Error message component with optional retry functionality
 *
 * Usage:
 * ```tsx
 * <ErrorMessage message="Failed to load contacts" />
 * <ErrorMessage
 *   message="Permission denied"
 *   onRetry={() => requestPermission()}
 * />
 * ```
 */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
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
  errorIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    ...theme.typography.headline,
    color: theme.colors.background,
  },
});
