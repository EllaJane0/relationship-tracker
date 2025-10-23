/**
 * useContacts Hook
 * Custom React hook for managing device contacts and permissions
 * Handles permission requests, contact loading, and state management
 */

import { useState, useEffect } from 'react';
import { Contact, PermissionStatus } from '../types/models';
import {
  requestPermission,
  getPermissionStatus,
  getAllContacts,
} from '../services/contactService';

/**
 * Return type for the useContacts hook
 */
export interface UseContactsReturn {
  /** Array of contacts from the device */
  contacts: Contact[];

  /** Whether contacts are currently being loaded */
  loading: boolean;

  /** Error message if loading failed, or null if no error */
  error: string | null;

  /** Function to request contact permissions from the user */
  requestPermission: () => Promise<void>;

  /** Function to manually reload contacts */
  loadContacts: () => Promise<void>;

  /** Current permission status */
  permissionStatus: PermissionStatus;
}

/**
 * Custom hook to manage device contacts and permissions
 *
 * This hook automatically:
 * 1. Checks permission status on mount
 * 2. Loads contacts if permission is granted
 * 3. Provides functions to request permissions and reload contacts
 *
 * Usage:
 * ```tsx
 * const {
 *   contacts,
 *   loading,
 *   error,
 *   requestPermission,
 *   permissionStatus
 * } = useContacts();
 *
 * if (permissionStatus !== PermissionStatus.GRANTED) {
 *   return <Button onPress={requestPermission}>Allow Access</Button>;
 * }
 *
 * if (loading) {
 *   return <LoadingIndicator />;
 * }
 *
 * return <ContactList contacts={contacts} />;
 * ```
 *
 * @returns Object containing contacts, loading state, error state, and helper functions
 */
export function useContacts(): UseContactsReturn {
  // State for contacts array
  const [contacts, setContacts] = useState<Contact[]>([]);

  // State for loading indicator
  const [loading, setLoading] = useState<boolean>(true);

  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // State for permission status
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(
    PermissionStatus.UNDETERMINED
  );

  /**
   * Load contacts from the device
   * This function checks permissions and fetches contacts if granted
   */
  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading contacts...');

      // Fetch contacts from device
      const fetchedContacts = await getAllContacts();

      setContacts(fetchedContacts);
      setPermissionStatus(PermissionStatus.GRANTED);

      console.log(`Loaded ${fetchedContacts.length} contacts`);
    } catch (err) {
      // Handle errors during contact loading
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load contacts';
      console.error('Error loading contacts:', errorMessage);

      setError(errorMessage);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request permission to access contacts
   * Shows the system permission dialog and loads contacts if granted
   */
  const handleRequestPermission = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Requesting contact permission...');

      // Request permission from the user
      const response = await requestPermission();

      if (response.status === 'granted') {
        // Permission granted - load contacts
        setPermissionStatus(PermissionStatus.GRANTED);
        await loadContacts();
      } else if (response.status === 'denied') {
        // Permission denied
        setPermissionStatus(PermissionStatus.DENIED);
        setError('Contact permission was denied');
        setLoading(false);
      } else {
        // Permission undetermined (cancelled)
        setPermissionStatus(PermissionStatus.UNDETERMINED);
        setLoading(false);
      }
    } catch (err) {
      // Handle errors during permission request
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to request permissions';
      console.error('Error requesting permission:', errorMessage);

      setError(errorMessage);
      setPermissionStatus(PermissionStatus.DENIED);
      setLoading(false);
    }
  };

  /**
   * Check permission status and load contacts on mount
   * This effect runs once when the component using this hook mounts
   */
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    /**
     * Initialize contacts by checking permissions
     */
    async function initializeContacts() {
      try {
        console.log('Checking contact permissions...');

        // Check current permission status without requesting
        const status = await getPermissionStatus();

        if (!isMounted) return;

        setPermissionStatus(status);

        if (status === PermissionStatus.GRANTED) {
          // Permission already granted - load contacts automatically
          await loadContacts();
        } else {
          // Permission not granted - stop loading, wait for user action
          setLoading(false);
        }
      } catch (err) {
        // Handle errors during initialization
        if (!isMounted) return;

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to initialize contacts';
        console.error('Error initializing contacts:', errorMessage);

        setError(errorMessage);
        setLoading(false);
      }
    }

    // Start initialization
    initializeContacts();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  // Return the contacts state and helper functions
  return {
    contacts,
    loading,
    error,
    requestPermission: handleRequestPermission,
    loadContacts,
    permissionStatus,
  };
}
