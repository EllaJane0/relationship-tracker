/**
 * Database Service (Web Version)
 * Stub implementation for web platform - SQLite not supported
 * In the future, this could use Supabase or IndexedDB
 */

/**
 * Initialize the database - not supported on web
 */
export function initDatabase(): any {
  console.warn('SQLite database not supported on web platform');
  return null;
}

/**
 * Create tables - not supported on web
 */
export function createTables(db: any): Promise<void> {
  return Promise.resolve();
}

/**
 * Add interaction - not supported on web
 */
export function addInteraction(
  db: any,
  contactId: string,
  interactionDate: string,
  notes?: string
): Promise<void> {
  console.warn('Database operations not supported on web platform');
  return Promise.resolve();
}

/**
 * Get last interaction - not supported on web
 */
export function getLastInteraction(
  db: any,
  contactId: string
): Promise<{ interaction_date: string } | null> {
  return Promise.resolve(null);
}

/**
 * Get all interactions - not supported on web
 */
export function getAllInteractions(db: any): Promise<any[]> {
  return Promise.resolve([]);
}

/**
 * Delete interaction - not supported on web
 */
export function deleteInteraction(db: any, id: number): Promise<void> {
  return Promise.resolve();
}
