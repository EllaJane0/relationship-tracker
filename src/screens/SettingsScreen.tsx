/**
 * SettingsScreen Component
 * Settings and preferences screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NavigationProp } from '@react-navigation/native';
import { RootTabParamList } from '../types/navigation';
import { theme } from '../styles/theme';
import { AppInfo } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

/**
 * Props for SettingsScreen component
 */
interface SettingsScreenProps {
  navigation: NavigationProp<RootTabParamList, 'Settings'>;
}

/**
 * Settings screen component
 * Displays app settings and preferences
 *
 * Future enhancements:
 * - Notification settings
 * - Reminder frequency settings
 * - Privacy settings
 * - About section with links
 * - Dark mode toggle
 */
export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <Text style={styles.title}>Settings</Text>

        {/* Upgrade Card */}
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => (navigation as any).navigate('Subscription')}
        >
          <Text style={styles.upgradeEmoji}>🎁</Text>
          <View style={styles.upgradeTextContainer}>
            <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
            <Text style={styles.upgradeSubtitle}>
              Create unlimited lists & advanced features for $4.99/month
            </Text>
          </View>
          <Text style={styles.upgradeArrow}>→</Text>
        </TouchableOpacity>

        {/* Account Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={signOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{AppInfo.NAME}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{AppInfo.VERSION}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoValue}>{AppInfo.DESCRIPTION}</Text>
          </View>
        </View>

        {/* Coming Soon Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            More features coming in future updates:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Item claiming (mark as purchased)</Text>
            <Text style={styles.featureItem}>• Price tracking & alerts</Text>
            <Text style={styles.featureItem}>• List categories & tags</Text>
            <Text style={styles.featureItem}>• Collaborative lists</Text>
            <Text style={styles.featureItem}>• Dark mode</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Made with 🎄 for joyful gift giving
        </Text>
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
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    flex: 1,
    textAlign: 'right',
    marginLeft: theme.spacing.md,
  },
  comingSoonText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.md,
  },
  featureList: {
    gap: theme.spacing.xs,
  },
  featureItem: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  footer: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    ...theme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  upgradeEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    ...theme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  upgradeSubtitle: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
  upgradeArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    marginLeft: theme.spacing.sm,
  },
});
