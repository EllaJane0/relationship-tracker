/**
 * Theme Configuration
 * iOS-optimized design system with colors, spacing, typography, and border radius
 * This theme ensures consistent styling throughout the app
 */

export const theme = {
  /**
   * Color Palette
   * Uses iOS system colors for a native feel
   */
  colors: {
    /** Primary action color - iOS blue */
    primary: '#007AFF',

    /** Main background color */
    background: '#FFFFFF',

    /** Secondary background for grouped content */
    secondaryBackground: '#F2F2F7',

    /** Primary text color */
    text: '#000000',

    /** Secondary/subtle text color */
    secondaryText: '#8E8E93',

    /** Border and separator color */
    border: '#C6C6C8',

    /** Error and destructive action color */
    error: '#FF3B30',

    /** Success and positive action color */
    success: '#34C759',

    /** Warning color */
    warning: '#FF9500',

    /** Disabled state color */
    disabled: '#D1D1D6',
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
} as const;

/**
 * Type export for theme
 * Enables TypeScript autocompletion when using the theme
 */
export type Theme = typeof theme;
