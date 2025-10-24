/**
 * TopNav Component
 * Top navigation bar with logo, nav links, and user menu
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { theme } from '../styles/theme';
import type { MainStackParamList } from '../types/navigation';

export function TopNav() {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute();

  const isActive = (routeName: string) => {
    return route.name === routeName;
  };

  const navItems = [
    { name: 'Home', route: 'Home' as const, icon: 'home' },
    { name: 'My Lists', route: 'MyLists' as const, icon: 'list' },
    { name: 'Dashboard', route: 'Dashboard' as const, icon: 'albums' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <TouchableOpacity
          style={styles.logo}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.logoEmoji}>🎄</Text>
          <Text style={styles.logoText}>Christmas List</Text>
        </TouchableOpacity>

        {/* Navigation Links */}
        <View style={styles.navLinks}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.navItem,
                isActive(item.route) && styles.navItemActive
              ]}
              onPress={() => navigation.navigate(item.route)}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={isActive(item.route) ? theme.colors.primary : theme.colors.text}
              />
              <Text style={[
                styles.navItemText,
                isActive(item.route) && styles.navItemTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Actions */}
        <View style={styles.userSection}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateList')}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>New List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.accent} />
            <Text style={styles.settingsButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoEmoji: {
    fontSize: 28,
  },
  logoText: {
    ...theme.typography.headline,
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  navLinks: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  navItemActive: {
    backgroundColor: theme.colors.background,
  },
  navItemText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  navItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    position: 'relative',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  createButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  settingsButtonText: {
    ...theme.typography.body,
    color: theme.colors.accent,
    fontWeight: '600',
  },
});
