/**
 * useDatabase Hook
 * Custom React hook for initializing and managing the SQLite database
 * This hook handles database initialization on mount and provides the database instance
 * to consuming components
 */

import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { initDatabase, createTables } from '../services/databaseService';

/**
 * Return type for the useDatabase hook
 */
export interface UseDatabaseReturn {
  /** The SQLite database instance, or null if not yet initialized */
  db: SQLite.Database | null;

  /** Whether the database has been successfully initialized */
  initialized: boolean;

  /** Error message if database initialization failed, or null if no error */
  error: string | null;
}

/**
 * Custom hook to initialize and provide access to the SQLite database
 *
 * Usage:
 * ```tsx
 * const { db, initialized, error } = useDatabase();
 *
 * if (error) {
 *   return <ErrorMessage message={error} />;
 * }
 *
 * if (!initialized || !db) {
 *   return <LoadingIndicator />;
 * }
 *
 * // Use db for database operations
 * ```
 *
 * @returns Object containing database instance, initialization status, and error state
 */
export function useDatabase(): UseDatabaseReturn {
  // State for the database instance
  const [db, setDb] = useState<SQLite.Database | null>(null);

  // State to track if database is fully initialized
  const [initialized, setInitialized] = useState<boolean>(false);

  // State to track any initialization errors
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize database on component mount
   * This effect runs once when the component using this hook mounts
   */
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    /**
     * Async function to initialize the database
     * Separated from useEffect to allow async/await syntax
     */
    async function setupDatabase() {
      try {
        console.log('Initializing database...');

        // Step 1: Open or create the database
        const database = await initDatabase();

        // Check if component is still mounted before updating state
        if (!isMounted) return;

        // Step 2: Create tables and indexes
        await createTables(database);

        // Check again if component is still mounted
        if (!isMounted) return;

        // Step 3: Update state with successful initialization
        setDb(database);
        setInitialized(true);
        setError(null);

        console.log('Database initialized successfully');
      } catch (err) {
        // Only update state if component is still mounted
        if (!isMounted) return;

        // Handle initialization errors
        const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
        console.error('Database initialization failed:', errorMessage);

        setError(errorMessage);
        setInitialized(false);
        setDb(null);
      }
    }

    // Start the database initialization
    setupDatabase();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  // Return the database state to consuming components
  return {
    db,
    initialized,
    error,
  };
}
