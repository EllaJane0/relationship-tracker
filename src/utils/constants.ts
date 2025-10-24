/**
 * App Constants
 * Centralized location for app-wide constant values
 */

/**
 * Error Messages
 * User-friendly error messages displayed throughout the app
 */
export const ErrorMessages = {
  /** Shown when contact permission is denied */
  PERMISSION_DENIED:
    "We need access to your contacts to help you track interactions. Please enable permissions in Settings.",

  /** Shown when contact loading fails */
  CONTACT_LOAD_FAILED:
    "Unable to load contacts. Please try again.",

  /** Shown when database initialization fails */
  DATABASE_INIT_FAILED:
    "Database initialization failed. Some features may be limited.",

  /** Generic fallback error message */
  UNKNOWN_ERROR:
    "Something went wrong. Please try again.",
} as const;

/**
 * App Information
 * Basic app metadata
 */
export const AppInfo = {
  NAME: 'Christmas List Sharer',
  VERSION: '1.0.0',
  DESCRIPTION: 'Create and share wish lists with friends and family',
} as const;

/**
 * Database Configuration
 * SQLite database settings
 */
export const DatabaseConfig = {
  NAME: 'relationship_tracker.db',
  TABLE_NAME: 'interactions',
} as const;
