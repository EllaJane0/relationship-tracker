/**
 * Root Navigator Component
 * Handles authentication state and routing between Auth and Main stacks
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { CreateListScreen } from '../screens/CreateListScreen';
import { EditListScreen } from '../screens/EditListScreen';
import { ListDetailScreen } from '../screens/ListDetailScreen';
import { SharedListViewScreen } from '../screens/SharedListViewScreen';
import { theme } from '../styles/theme';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is signed in - show main app
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="CreateList"
            component={CreateListScreen}
            options={{
              headerShown: true,
              title: 'Create List',
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="EditList"
            component={EditListScreen}
            options={{
              headerShown: true,
              title: 'Edit List'
            }}
          />
          <Stack.Screen
            name="ListDetail"
            component={ListDetailScreen}
            options={{
              headerShown: true,
              title: 'List Details'
            }}
          />
          <Stack.Screen
            name="SharedListView"
            component={SharedListViewScreen}
            options={{
              headerShown: true,
              title: 'Shared List'
            }}
          />
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={{ headerShown: true, title: 'Upgrade' }}
          />
        </>
      ) : (
        // User is not signed in - show auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
