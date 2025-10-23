/**
 * HomeScreen Component
 * Dashboard/home screen showing welcome message and app overview
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NavigationProp } from '@react-navigation/native';
import { RootTabParamList } from '../types/navigation';
import { theme } from '../styles/theme';
import { AppInfo } from '../utils/constants';

/**
 * Props for HomeScreen component
 */
interface HomeScreenProps {
  navigation: NavigationProp<RootTabParamList, 'Home'>;
}

/**
 * Home screen component
 * Displays welcome message and app information
 *
 * Future enhancements:
 * - Summary statistics (total contacts, contacts to reach out to)
 * - Quick actions
 * - Recent interactions
 */
export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{AppInfo.NAME}</Text>
          <Text style={styles.subtitle}>{AppInfo.DESCRIPTION}</Text>
        </View>

        {/* Welcome Card */}
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>👋</Text>
          <Text style={styles.cardTitle}>Welcome!</Text>
          <Text style={styles.cardText}>
            This app helps you keep track of when you last connected with
            friends and family, so you never lose touch with the people who
            matter most.
          </Text>
        </View>

        {/* How it works */}
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>📱</Text>
          <Text style={styles.cardTitle}>How it works</Text>
          <View style={styles.stepContainer}>
            <Text style={styles.step}>1. Grant access to your contacts</Text>
            <Text style={styles.step}>
              2. View all your contacts in one place
            </Text>
            <Text style={styles.step}>
              3. Track when you last reached out
            </Text>
            <Text style={styles.step}>
              4. Never forget to stay in touch
            </Text>
          </View>
        </View>

        {/* Get Started */}
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🚀</Text>
          <Text style={styles.cardTitle}>Get Started</Text>
          <Text style={styles.cardText}>
            Tap the "Contacts" tab below to view your contacts and start
            tracking your interactions.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.version}>Version {AppInfo.VERSION}</Text>
      </ScrollView>
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
  contentContainer: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  card: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  cardText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    lineHeight: 24,
  },
  stepContainer: {
    gap: theme.spacing.xs,
  },
  step: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    lineHeight: 24,
  },
  version: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});
