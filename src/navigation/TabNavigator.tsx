/**
 * TabNavigator Component
 * Main content area with top navigation
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { theme } from '../styles/theme';
import { TopNav } from '../components/TopNav';

// Import screens
import { HomeScreen } from '../screens/HomeScreen';
import { MyListsScreen } from '../screens/MyListsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

/**
 * Create the tab navigator with type safety
 */
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * TabNavigator Component
 * Displays screens with top navigation bar
 */
export function TabNavigator() {
  return (
    <View style={styles.container}>
      <TopNav />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyLists" component={MyListsScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
