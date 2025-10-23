/**
 * Database Service
 * Handles all SQLite database operations for storing contact interaction data
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { DatabaseConfig } from '../utils/constants';

/**
 * Initialize the SQLite database
 * Opens an existing database or creates a new one if it doesn't exist
 *
 * @returns The database instance
 * @throws Error if database cannot be opened or on unsupported platform
 */
export function initDatabase(): SQLite.Database {
  // SQLite is not supported on web
  if (Platform.OS === 'web') {
    throw new Error('Database not supported on web platform');
  }

  try {
    // Open or create the database (synchronous in v13)
    const db = SQLite.openDatabase(DatabaseConfig.NAME);
    console.log('Database opened successfully:', DatabaseConfig.NAME);
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw new Error('Failed to initialize database');
  }
}

/**
 * Create the interactions table
 * Sets up the database schema for storing contact interaction records
 *
 * Schema:
 * - id: Auto-incrementing primary key
 * - contact_id: Reference to device contact ID
 * - interaction_date: ISO 8601 date string of the interaction
 * - created_at: Timestamp when record was created
 * - notes: Optional notes about the interaction (for future use)
 *
 * Includes indexes for performance:
 * - idx_contact_id: Fast lookups by contact
 * - idx_interaction_date: Fast lookups by date
 *
 * @param db - The database instance
 * @returns Promise that resolves when tables are created
 * @throws Error if table creation fails
 */
export function createTables(db: SQLite.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create the interactions table with proper schema
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${DatabaseConfig.TABLE_NAME} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id TEXT NOT NULL,
            interaction_date TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            UNIQUE(contact_id, interaction_date)
          );`
        );

        // Create index on contact_id for fast lookups
        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_contact_id
           ON ${DatabaseConfig.TABLE_NAME}(contact_id);`
        );

        // Create index on interaction_date for date-based queries
        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_interaction_date
           ON ${DatabaseConfig.TABLE_NAME}(interaction_date);`
        );
      },
      (error) => {
        console.error('Error creating database tables:', error);
        reject(new Error('Failed to create database tables'));
      },
      () => {
        console.log('Database tables created successfully');
        resolve();
      }
    );
  });
}

/**
 * Save a contact interaction to the database
 * Records when the user last contacted someone
 *
 * @param db - The database instance
 * @param contactId - The unique ID of the contact
 * @param date - The date of the interaction
 * @returns Promise that resolves when the interaction is saved
 * @throws Error if the save operation fails
 */
export function saveInteraction(
  db: SQLite.Database,
  contactId: string,
  date: Date
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Convert date to ISO 8601 string for storage
    const dateString = date.toISOString();

    db.transaction(
      (tx) => {
        // Insert or replace the interaction record
        tx.executeSql(
          `INSERT OR REPLACE INTO ${DatabaseConfig.TABLE_NAME}
           (contact_id, interaction_date)
           VALUES (?, ?)`,
          [contactId, dateString]
        );
      },
      (error) => {
        console.error('Error saving interaction:', error);
        reject(new Error('Failed to save interaction'));
      },
      () => {
        console.log(`Interaction saved for contact ${contactId} on ${dateString}`);
        resolve();
      }
    );
  });
}

/**
 * Get the last interaction date for a contact
 * Retrieves the most recent interaction date from the database
 *
 * @param db - The database instance
 * @param contactId - The unique ID of the contact
 * @returns Promise resolving to the last interaction date, or null if none exists
 */
export function getLastInteraction(
  db: SQLite.Database,
  contactId: string
): Promise<Date | null> {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      // Query for the most recent interaction for this contact
      tx.executeSql(
        `SELECT interaction_date
         FROM ${DatabaseConfig.TABLE_NAME}
         WHERE contact_id = ?
         ORDER BY interaction_date DESC
         LIMIT 1`,
        [contactId],
        (_, result) => {
          // Return the date if found, null otherwise
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve(new Date(row.interaction_date));
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error getting last interaction:', error);
          // Return null gracefully instead of throwing to avoid breaking UI
          resolve(null);
          return false; // Don't rollback transaction
        }
      );
    });
  });
}

/**
 * Database Service Object
 * Export all database functions as a cohesive service
 */
export const DatabaseService = {
  initDatabase,
  createTables,
  saveInteraction,
  getLastInteraction,
};
