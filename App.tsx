/**
 * Root App Component
 * Entry point for the Relationship Tracker application
 *
 * This app helps users maintain relationships by tracking when they
 * last contacted friends and family, with reminders to stay in touch.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * Main App Component
 * Wraps the entire application with necessary providers
 *
 * Architecture:
 * - SafeAreaProvider: Handles device safe areas (notch, home indicator)
 * - AuthProvider: Manages authentication state and Supabase integration
 * - NavigationContainer: Root navigation provider
 * - RootNavigator: Handles auth vs main app routing
 * - StatusBar: iOS-styled status bar
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
