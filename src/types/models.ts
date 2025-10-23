/**
 * Data Model Type Definitions
 * Defines interfaces for core app data structures
 */

/**
 * Contact Model
 * Represents a contact from the device's contact list
 */
export interface Contact {
  /** Unique identifier from device contact database */
  id: string;

  /** Display name - defaults to "Unknown Contact" if not available */
  name: string;

  /** Array of phone numbers associated with this contact */
  phoneNumbers?: PhoneNumber[];

  /** Whether the contact has an associated image (for future use) */
  imageAvailable?: boolean;
}

/**
 * Phone Number Model
 * Represents a single phone number entry for a contact
 */
export interface PhoneNumber {
  /** The phone number string */
  number: string;

  /** Type of phone number (e.g., "mobile", "home", "work") */
  type?: string;

  /** Custom label for the phone number */
  label?: string;

  /** Unique identifier for this phone number */
  id: string;
}

/**
 * Interaction Model
 * Represents a recorded interaction with a contact
 * This data is stored in the SQLite database
 */
export interface Interaction {
  /** Auto-generated unique identifier for the interaction */
  id: number;

  /** Reference to the contact ID this interaction belongs to */
  contactId: string;

  /** Date and time of the interaction */
  interactionDate: Date;

  /** Timestamp when this record was created */
  createdAt: Date;

  /** Optional notes about the interaction (for future use) */
  notes?: string;
}

/**
 * Permission Status Enum
 * Represents the current state of contact permissions
 */
export enum PermissionStatus {
  /** Permission has not been requested yet */
  UNDETERMINED = 'undetermined',

  /** User has granted permission */
  GRANTED = 'granted',

  /** User has denied permission */
  DENIED = 'denied',
}
