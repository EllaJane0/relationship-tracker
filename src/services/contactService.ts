/**
 * Contact Service
 * Handles device contact access, permissions, and contact retrieval
 */

import * as Contacts from 'expo-contacts';
import { Contact, PermissionStatus } from '../types/models';

/**
 * Request permission to access device contacts
 * Shows the system permission dialog to the user
 *
 * @returns Promise resolving to the permission response
 * @throws Error if permission request fails
 */
export async function requestPermission(): Promise<Contacts.PermissionResponse> {
  try {
    console.log('Requesting contact permissions...');
    const permissionResponse = await Contacts.requestPermissionsAsync();
    console.log('Permission response:', permissionResponse.status);
    return permissionResponse;
  } catch (error) {
    console.error('Error requesting contact permission:', error);
    throw new Error('Failed to request contact permissions');
  }
}

/**
 * Get the current permission status for contacts
 * Checks if the app has permission to access contacts without requesting it
 *
 * @returns Promise resolving to the current permission status
 */
export async function getPermissionStatus(): Promise<PermissionStatus> {
  try {
    const { status } = await Contacts.getPermissionsAsync();

    // Map expo-contacts status to our PermissionStatus enum
    if (status === 'granted') {
      return PermissionStatus.GRANTED;
    } else if (status === 'denied') {
      return PermissionStatus.DENIED;
    } else {
      return PermissionStatus.UNDETERMINED;
    }
  } catch (error) {
    console.error('Error getting permission status:', error);
    // Default to undetermined if we can't check status
    return PermissionStatus.UNDETERMINED;
  }
}

/**
 * Retrieve all contacts from the device
 * Requires that contact permissions have already been granted
 *
 * @returns Promise resolving to an array of formatted contacts
 * @throws Error if contacts cannot be retrieved or permission is not granted
 */
export async function getAllContacts(): Promise<Contact[]> {
  try {
    console.log('Fetching contacts from device...');

    // Check if we have permission first
    const { status } = await Contacts.getPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Contact permission not granted');
    }

    // Fetch contacts with phone numbers and name
    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Name,
        Contacts.Fields.Image,
      ],
    });

    console.log(`Retrieved ${data.length} contacts from device`);

    // Format contacts to match our Contact interface
    const formattedContacts: Contact[] = data
      .filter((contact) => contact.id) // Filter out contacts without IDs first
      .map((contact) => {
        // Handle missing name with fallback
        const name = contact.name || 'Unknown Contact';

        // Format phone numbers to match our PhoneNumber interface
        const phoneNumbers = contact.phoneNumbers?.map((phone) => ({
          number: phone.number || '',
          type: phone.label || undefined,
          label: phone.label || undefined,
          id: phone.id || `${contact.id}-${phone.number}`,
        }));

        return {
          id: contact.id!, // Safe to use ! here because we filtered out undefined IDs
          name,
          phoneNumbers,
          imageAvailable: contact.imageAvailable || false,
        };
      });

    // Already filtered, but keep for extra safety
    const validContacts = formattedContacts.filter(
      (contact) => contact.id && contact.name
    );

    console.log(`Returning ${validContacts.length} valid contacts`);
    return validContacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw new Error('Failed to fetch contacts');
  }
}

/**
 * Contact Service Object
 * Export all contact functions as a cohesive service
 */
export const ContactService = {
  requestPermission,
  getPermissionStatus,
  getAllContacts,
};
