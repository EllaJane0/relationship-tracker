/**
 * Theme Configuration
 * iOS-optimized design system with colors, spacing, typography, and border radius
 * This theme ensures consistent styling throughout the app
 */

export const theme = {
  /**
   * Color Palette
   * Christmas-themed colors for festive feel
   */
  colors: {
    /** Primary action color - Christmas red */
    primary: '#C41E3A',

    /** Main background color - Light cream/snow */
    background: '#FFF9F0',

    /** Card background color - Pure white like snow */
    cardBackground: '#FFFFFF',

    /** Secondary background for grouped content - Light cream */
    secondaryBackground: '#FFF9F0',

    /** Primary text color - Dark green */
    text: '#0F3D0F',

    /** Secondary/subtle text color - Medium gray */
    textSecondary: '#6B7280',

    /** Alternate for backwards compatibility */
    secondaryText: '#6B7280',

    /** Border and separator color - Light gold */
    border: '#E5D5B7',

    /** Error and destructive action color - Christmas red */
    error: '#C41E3A',

    /** Success and positive action color - Christmas green */
    success: '#165B33',

    /** Warning color - Gold */
    warning: '#D4AF37',

    /** Disabled state color */
    disabled: '#D1D1D6',

    /** Accent color - Christmas green */
    accent: '#165B33',

    /** Gold accent for special elements */
    gold: '#D4AF37',
  },

  /**
   * Spacing Scale
   * Consistent spacing values for margins and padding
   */
  spacing: {
    /** Extra small - 4px */
    xs: 4,

    /** Small - 8px */
    sm: 8,

    /** Medium - 16px (default) */
    md: 16,

    /** Large - 24px */
    lg: 24,

    /** Extra large - 32px */
    xl: 32,
  },

  /**
   * Typography Scale
   * iOS-standard font sizes and weights
   */
  typography: {
    /** Large title for main headings */
    title: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
    },

    /** Headline for section headers */
    headline: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 22,
    },

    /** Body text for primary content */
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 22,
    },

    /** Caption for secondary/supporting text */
    caption: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },

    /** Small footnote text */
    footnote: {
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },

  /**
   * Border Radius Values
   * Rounded corner sizes for UI elements
   */
  borderRadius: {
    /** Small radius - 8px */
    sm: 8,

    /** Medium radius - 12px */
    md: 12,

    /** Large radius - 16px */
    lg: 16,

    /** Extra large radius - 20px */
    xl: 20,
  },

  /**
   * Shadow Styles
   * Elevation and depth effects for cards and elevated UI
   */
  shadows: {
    /** Small shadow for subtle elevation */
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    /** Medium shadow for standard elevation */
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },

    /** Large shadow for prominent elevation */
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;

/**
 * Type export for theme
 * Enables TypeScript autocompletion when using the theme
 */
export type Theme = typeof theme;
