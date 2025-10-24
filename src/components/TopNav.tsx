/**
 * TopNav Component
 * Top navigation bar with logo, nav links, and user menu
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import type { MainStackParamList } from '../types/navigation';

export function TopNav() {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

        {/* User Menu */}
        <View style={styles.userSection}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateList')}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>New List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.userButton}
            onPress={() => setShowUserMenu(!showUserMenu)}
          >
            <Ionicons name="person-circle" size={32} color={theme.colors.accent} />
          </TouchableOpacity>

          {showUserMenu && (
            <View style={styles.userMenu}>
              <View style={styles.userMenuHeader}>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
              <TouchableOpacity
                style={styles.userMenuItem}
                onPress={() => {
                  setShowUserMenu(false);
                  navigation.navigate('Settings');
                }}
              >
                <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
                <Text style={styles.userMenuItemText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.userMenuItem}
                onPress={() => {
                  setShowUserMenu(false);
                  (navigation as any).navigate('Subscription');
                }}
              >
                <Ionicons name="gift-outline" size={20} color={theme.colors.gold} />
                <Text style={styles.userMenuItemText}>Upgrade to Pro</Text>
              </TouchableOpacity>
              <View style={styles.userMenuDivider} />
              <TouchableOpacity
                style={styles.userMenuItem}
                onPress={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
              >
                <Ionicons name="log-out-outline" size={20} color={theme.colors.accent} />
                <Text style={[styles.userMenuItemText, { color: theme.colors.accent }]}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  userButton: {
    padding: theme.spacing.xs,
  },
  userMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium,
    minWidth: 250,
    borderWidth: 1,
    borderColor: theme.colors.border,
    zIndex: 1000,
  },
  userMenuHeader: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userEmail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  userMenuItemText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  userMenuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
});
