/**
 * HomeScreen
 * Landing page that describes what the app does and how to get started
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { theme } from '../styles/theme';
import type { MainStackParamList } from '../types/navigation';

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎄</Text>
          <Text style={styles.heroTitle}>Christmas List Sharer</Text>
          <Text style={styles.heroSubtitle}>
            Create and share your holiday wish lists with friends and family
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          {/* Feature 1 */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="link" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>1. Paste Product Links</Text>
              <Text style={styles.featureDescription}>
                Add items to your list by pasting links from Amazon, Etsy, Target, or any online store.
                We'll automatically grab the product details and images.
              </Text>
            </View>
          </View>

          {/* Feature 2 */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="create" size={28} color={theme.colors.accent} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>2. Add Your Notes</Text>
              <Text style={styles.featureDescription}>
                Include specific details like color, size, or preferences for each item.
                Help gift-givers get exactly what you want!
              </Text>
            </View>
          </View>

          {/* Feature 3 */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="share-social" size={28} color={theme.colors.gold} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>3. Share With Loved Ones</Text>
              <Text style={styles.featureDescription}>
                Generate a shareable link and send it to friends and family.
                They can view your list and save it to their dashboard.
              </Text>
            </View>
          </View>

          {/* Feature 4 */}
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="gift" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>4. Browse Saved Lists</Text>
              <Text style={styles.featureDescription}>
                When someone shares their list with you, save it to your dashboard.
                Access all your loved ones' wish lists in one place.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateList')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Create Your First List</Text>
          </TouchableOpacity>

          <Text style={styles.ctaHint}>
            Or explore the "My Lists" tab to see your existing lists
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Use Christmas List Sharer?</Text>

          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.benefitText}>No more guessing what to buy</Text>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.benefitText}>Avoid duplicate gifts</Text>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.benefitText}>Share specific product details</Text>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.benefitText}>Access lists from any device</Text>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.benefitText}>Keep everything organized in one place</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for joyful gift giving
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  heroEmoji: {
    fontSize: 72,
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    ...theme.typography.title,
    fontSize: 32,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    ...theme.typography.body,
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 500,
  },
  featuresSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.title,
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  ctaSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  primaryButtonText: {
    ...theme.typography.headline,
    color: '#FFFFFF',
    fontSize: 18,
  },
  ctaHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  benefitsSection: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  benefitText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
