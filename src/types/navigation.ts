/**
 * Navigation Type Definitions
 * Provides type-safe navigation throughout the app using React Navigation
 */

import type { NavigationProp, NavigatorScreenParams } from '@react-navigation/native';

/**
 * Public Stack Parameter List
 * Screens accessible without authentication (public sharing)
 */
export type PublicStackParamList = {
  SharedListView: { shareToken: string };
};

/**
 * Auth Stack Parameter List
 * Authentication screens for login/signup
 */
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

/**
 * Root Tab Navigator Parameter List
 * Defines the screens available in the bottom tab navigation
 * and the parameters each screen accepts (undefined = no params)
 */
export type RootTabParamList = {
  MyLists: undefined;
  Dashboard: undefined;
  Settings: undefined;
};

/**
 * Main Stack Parameter List
 * Authenticated user screens including tabs and modal screens
 */
export type MainStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  CreateList: undefined;
  EditList: { listId: string };
  ListDetail: { listId: string };
  Subscription: undefined; // Keep existing subscription screen
};

/**
 * Root Navigator Parameter List
 * Top-level navigator that handles Auth, Public, and Main stacks
 */
export type RootNavigatorParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
  Public: NavigatorScreenParams<PublicStackParamList>;
};

/**
 * Helper type for screen navigation props
 * Usage: NavigationProp<RootTabParamList, 'MyLists'>
 */
export type TabNavigationProp = NavigationProp<RootTabParamList>;
export type MainNavigationProp = NavigationProp<MainStackParamList>;
export type PublicNavigationProp = NavigationProp<PublicStackParamList>;
export type AuthNavigationProp = NavigationProp<AuthStackParamList>;
