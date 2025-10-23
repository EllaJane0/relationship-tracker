/**
 * Subscription Screen Component
 * Handles subscription management and upgrades
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

export function SubscriptionScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    setLoading(true);

    try {
      // Call serverless function to create Stripe Checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      // Check if we got HTML back (404 page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        // Running locally - API endpoint doesn't exist
        alert(
          'Stripe Payment Integration\n\n' +
          'The payment API is only available when deployed to Vercel.\n\n' +
          'To test payments:\n' +
          '1. Deploy the app to Vercel (see DEPLOYMENT.md)\n' +
          '2. Configure environment variables in Vercel\n' +
          '3. The Stripe Checkout will work on the live site!\n\n' +
          'For now, this is a demo of the subscription UI.'
        );
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);

      // Check if it's a JSON parsing error (likely local development)
      if (error.message && error.message.includes('JSON')) {
        alert(
          'Stripe Payment Integration\n\n' +
          'The payment API is only available when deployed to Vercel.\n\n' +
          'To test payments:\n' +
          '1. Deploy the app to Vercel (see DEPLOYMENT.md)\n' +
          '2. Configure environment variables in Vercel\n' +
          '3. The Stripe Checkout will work on the live site!\n\n' +
          'For now, this is a demo of the subscription UI.'
        );
      } else {
        alert(
          'Unable to process subscription\n\n' +
          error.message +
          '\n\nPlease try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Upgrade to Pro</Text>
        <Text style={styles.subtitle}>
          Get unlimited access to all premium features
        </Text>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.period}>per month</Text>

          <View style={styles.features}>
            <Text style={styles.featureTitle}>Premium Features:</Text>
            <Text style={styles.feature}>✓ Unlimited contacts</Text>
            <Text style={styles.feature}>✓ Custom reminders</Text>
            <Text style={styles.feature}>✓ Advanced analytics</Text>
            <Text style={styles.feature}>✓ Priority support</Text>
            <Text style={styles.feature}>✓ Ad-free experience</Text>
          </View>

          <TouchableOpacity
            style={[styles.subscribeButton, loading && styles.buttonDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            Cancel anytime. Powered by Stripe.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Maybe Later</Text>
        </TouchableOpacity>
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
  content: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.title,
    fontSize: 32,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  period: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.lg,
  },
  features: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  featureTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  feature: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
  },
  subscribeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    ...theme.typography.headline,
    color: theme.colors.background,
    fontWeight: '600',
    fontSize: 18,
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
  backButton: {
    marginTop: theme.spacing.xl,
  },
  backButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
});
