/**
 * Root App Component
 * Entry point for the Relationship Tracker application
 *
 * This app helps users maintain relationships by tracking when they
 * last contacted friends and family, with reminders to stay in touch.
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/styles/theme';

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
  useEffect(() => {
    // Set global input outline color for web
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.innerHTML = `
        input:focus,
        textarea:focus {
          outline: 2px solid ${theme.colors.accent} !important;
          outline-offset: -2px !important;
        }
        input,
        textarea {
          outline: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

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
