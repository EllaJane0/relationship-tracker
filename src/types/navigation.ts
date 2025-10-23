/**
 * Navigation Type Definitions
 * Provides type-safe navigation throughout the app using React Navigation
 */

/**
 * Root Tab Navigator Parameter List
 * Defines the screens available in the bottom tab navigation
 * and the parameters each screen accepts (undefined = no params)
 */
export type RootTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Settings: undefined;
};

/**
 * Helper type for screen navigation props
 * Usage: NavigationProp<RootTabParamList, 'Home'>
 */
import type { NavigationProp } from '@react-navigation/native';

export type TabNavigationProp = NavigationProp<RootTabParamList>;
