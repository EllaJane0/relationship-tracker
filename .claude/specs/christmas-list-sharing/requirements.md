# Requirements Document

## Introduction

A web application that enables users to create Christmas wish lists by adding product links, share these lists with friends and family via shareable URLs, and allows recipients to save and manage multiple shared lists in a personal dashboard. This redesign transforms the application into a gift coordination platform that simplifies holiday shopping and prevents duplicate gift purchases.

## Requirements

### Requirement 1: List Creation and Management

**User Story:** As a list creator, I want to create a new Christmas list by pasting product links, so that I can easily share my gift wishes with others.

#### Acceptance Criteria
1. WHEN a user accesses the application THEN the system SHALL display an interface to create a new list
2. WHEN a user provides a list title THEN the system SHALL create a list with that title
3. WHEN a user pastes a product URL into the input field THEN the system SHALL add that link to their list
4. WHEN a user adds a link THEN the system SHALL attempt to extract product metadata (title, image, price) from the URL
5. IF metadata extraction fails THEN the system SHALL allow manual entry of item details
6. WHEN a user views their list THEN the system SHALL display all added items with their details
7. WHEN a user wants to remove an item THEN the system SHALL provide a delete option for each item
8. WHEN a user wants to edit an item THEN the system SHALL allow updating the item details
9. WHEN a user saves a list THEN the system SHALL persist the list to the database

### Requirement 2: List Sharing

**User Story:** As a list creator, I want to generate a shareable link for my Christmas list, so that I can send it to my friends and family.

#### Acceptance Criteria
1. WHEN a user completes their list THEN the system SHALL generate a unique shareable URL
2. WHEN a shareable URL is generated THEN the system SHALL display it to the user
3. WHEN a user clicks a copy button THEN the system SHALL copy the shareable URL to their clipboard
4. WHEN anyone accesses the shareable URL THEN the system SHALL display the list in read-only mode
5. WHEN viewing a shared list THEN the system SHALL display the list creator's name and list title
6. WHEN viewing a shared list THEN the system SHALL show all items with their details and links

### Requirement 3: List Viewing and Access

**User Story:** As a gift recipient, I want to view a shared Christmas list via a link, so that I can see what items someone wants.

#### Acceptance Criteria
1. WHEN a recipient receives a shareable link THEN the system SHALL allow access without requiring authentication
2. WHEN a recipient opens a shared list link THEN the system SHALL display the complete list with all items
3. WHEN viewing items THEN the system SHALL display product images, titles, descriptions, and prices (if available)
4. WHEN a recipient clicks on an item link THEN the system SHALL open the product URL in a new tab
5. IF a list does not exist THEN the system SHALL display a "List not found" error message

### Requirement 4: Personal Dashboard and List Saving

**User Story:** As a gift recipient, I want to save shared lists to my personal dashboard, so that I can easily access all my loved ones' wish lists in one place.

#### Acceptance Criteria
1. WHEN a recipient views a shared list THEN the system SHALL display a "Save to My Dashboard" button
2. WHEN a recipient clicks "Save to My Dashboard" THEN the system SHALL prompt for authentication if not logged in
3. WHEN an authenticated user saves a list THEN the system SHALL add it to their personal dashboard
4. WHEN a user accesses their dashboard THEN the system SHALL display all saved lists
5. WHEN viewing the dashboard THEN the system SHALL show each list with the creator's name and list title
6. WHEN a user clicks on a saved list in the dashboard THEN the system SHALL navigate to that list's view
7. WHEN a user wants to remove a saved list THEN the system SHALL provide an option to unsave/remove it from the dashboard
8. IF a saved list is updated by the creator THEN the system SHALL reflect those updates when viewed from the dashboard

### Requirement 5: User Authentication

**User Story:** As a user, I want to create an account and log in, so that I can create lists and maintain a personal dashboard of saved lists.

#### Acceptance Criteria
1. WHEN a user wants to create a list THEN the system SHALL require authentication
2. WHEN a user wants to save lists to a dashboard THEN the system SHALL require authentication
3. WHEN a new user visits THEN the system SHALL provide sign-up functionality
4. WHEN a returning user visits THEN the system SHALL provide sign-in functionality
5. WHEN a user signs up THEN the system SHALL create a user account with email and password
6. WHEN a user logs in THEN the system SHALL authenticate their credentials
7. WHEN a user is authenticated THEN the system SHALL maintain their session
8. WHEN viewing shared lists anonymously THEN the system SHALL NOT require authentication

### Requirement 6: List Organization

**User Story:** As a list creator, I want to manage multiple Christmas lists, so that I can create different lists for different occasions or price ranges.

#### Acceptance Criteria
1. WHEN a user is authenticated THEN the system SHALL display all lists they have created
2. WHEN a user wants to create another list THEN the system SHALL allow creating multiple lists
3. WHEN viewing owned lists THEN the system SHALL display list title, creation date, and item count
4. WHEN a user wants to edit a list THEN the system SHALL provide access to modify existing lists
5. WHEN a user wants to delete a list THEN the system SHALL provide deletion functionality with confirmation
6. IF a list is deleted THEN the system SHALL remove it from the database and invalidate shareable links

### Requirement 7: Item Details and Metadata

**User Story:** As a list creator, I want product information to be automatically extracted from links, so that I don't have to manually enter details for each item.

#### Acceptance Criteria
1. WHEN a user pastes a product URL THEN the system SHALL attempt to fetch metadata from the URL
2. WHEN metadata is available THEN the system SHALL extract product title, image, price, and description
3. WHEN metadata extraction succeeds THEN the system SHALL populate item fields automatically
4. WHEN metadata extraction fails THEN the system SHALL allow manual entry of title, image URL, and notes
5. WHEN displaying items THEN the system SHALL show product images as thumbnails
6. WHEN an image URL is invalid THEN the system SHALL display a placeholder image

## Edge Cases and Constraints

### Edge Cases
1. **Duplicate URLs**: System should allow the same product URL to be added multiple times (e.g., wanting multiple quantities)
2. **Invalid URLs**: System should validate URL format before attempting metadata extraction
3. **Deleted Lists**: Accessing a deleted list's shareable link should show appropriate error message
4. **Private/Protected Product Pages**: Some URLs may require authentication; system should handle gracefully
5. **Very Long Lists**: System should handle lists with 100+ items without performance degradation
6. **Concurrent Edits**: If a list creator edits while someone is viewing, updates should be reflected appropriately

### Constraints
1. **Authentication**: Using existing Supabase authentication infrastructure
2. **Database**: Using existing Supabase database for data persistence
3. **URL Metadata**: Metadata extraction may not work for all e-commerce sites
4. **Public Access**: Shared lists must be publicly accessible via URL without authentication
5. **Data Privacy**: Users should only see lists they created or have saved
6. **Link Permanence**: Shareable links should remain valid unless the list is explicitly deleted

## Technical Considerations

### Data Models Required
- Users (existing)
- Lists (title, creator_id, created_at, updated_at, share_token)
- List Items (list_id, url, title, image_url, price, notes, position)
- Saved Lists (user_id, list_id, saved_at)

### Security
- Shareable links use random tokens (not sequential IDs)
- Authentication required for list creation and dashboard access
- Public read-only access for shared list viewing
- Users can only edit/delete their own created lists

### Performance
- Metadata extraction should not block UI
- Dashboard should paginate if user has many saved lists
- Images should be optimized/cached for fast loading
