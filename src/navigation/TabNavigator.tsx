/**
 * TabNavigator Component
 * Bottom tab navigation for the main app screens
 * Provides navigation between Home, Contacts, and Settings screens
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootTabParamList } from '../types/navigation';
import { theme } from '../styles/theme';

// Import screens
import { HomeScreen } from '../screens/HomeScreen';
import { MyListsScreen } from '../screens/MyListsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

/**
 * Create the bottom tab navigator with type safety
 */
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * TabNavigator Component
 * Configures bottom tab navigation with iOS-styled appearance
 *
 * Features:
 * - Three tabs: Home, Contacts, Settings
 * - iOS-style icons using Ionicons
 * - Theme-based styling
 * - Safe area handling for devices with notch/home indicator
 */
export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        // Header styling
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 0.5,
        },
        headerTitleStyle: {
          ...theme.typography.headline,
          color: theme.colors.text,
        },
        headerShadowVisible: false,

        // Tab bar styling
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontSize: 11,
        },

        // Icon size
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* My Lists Tab */}
      <Tab.Screen
        name="MyLists"
        component={MyListsScreen}
        options={{
          title: 'My Lists',
          tabBarLabel: 'My Lists',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Dashboard Tab */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'albums' : 'albums-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Settings Tab */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
