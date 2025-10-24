# Implementation Plan

## Database Setup

- [x] 1. Create Supabase database schema
  - Write SQL migration to create `lists` table with columns: id (UUID PK), creator_id (UUID FK), title (VARCHAR 255), share_token (VARCHAR 32 unique), created_at, updated_at
  - Write SQL migration to create `list_items` table with columns: id (UUID PK), list_id (UUID FK cascade delete), url (TEXT), title (VARCHAR 500), image_url (TEXT), price (DECIMAL 10,2), notes (TEXT), position (INTEGER), created_at
  - Write SQL migration to create `saved_lists` table with columns: id (UUID PK), user_id (UUID FK cascade delete), list_id (UUID FK cascade delete), saved_at, with unique constraint on (user_id, list_id)
  - Create indexes on lists.share_token (unique), list_items.list_id, saved_lists.user_id, saved_lists.list_id
  - _Requirements: 1.1, 2.1, 4.1, 6.1_

- [x] 2. Configure Row Level Security policies
  - Write RLS policy "Users can view own lists" on lists table for SELECT where auth.uid() = creator_id
  - Write RLS policy "Users can create lists" on lists table for INSERT with check auth.uid() = creator_id
  - Write RLS policy "Users can update own lists" on lists table for UPDATE where auth.uid() = creator_id
  - Write RLS policy "Users can delete own lists" on lists table for DELETE where auth.uid() = creator_id
  - Write RLS policy "Anyone can view lists by share token" on lists table for SELECT using true
  - Write RLS policy "Users can manage own list items" on list_items table using EXISTS subquery checking lists.creator_id = auth.uid()
  - Write RLS policy "Anyone can view list items" on list_items table for SELECT using true
  - Write RLS policy "Users can manage own saved lists" on saved_lists table where auth.uid() = user_id
  - _Requirements: 2.1, 3.1, 4.1, 5.7_

## Type Definitions

- [x] 3. Create TypeScript type definitions for list models
  - Create src/types/list-models.ts file
  - Define List interface with id, creatorId, title, shareToken, createdAt, updatedAt properties
  - Define ListItem interface with id, listId, url, title, imageUrl, price, notes, position, createdAt properties
  - Define ListSummary interface with id, title, itemCount, createdAt, shareToken properties
  - Define SavedListSummary interface with id, title, creatorName, itemCount, savedAt, shareToken properties
  - Define SharedList interface with id, title, creatorName, items array properties
  - Define ProductMetadata interface with title, imageUrl, price, description, success properties
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1_

- [x] 4. Update navigation type definitions
  - Update src/types/navigation.ts file
  - Define PublicStackParamList type with SharedListView route taking shareToken parameter
  - Update RootTabParamList to replace Home/Contacts with MyLists/Dashboard (both undefined params)
  - Define MainStackParamList with Tabs, CreateList (undefined), EditList (listId string), ListDetail (listId string) routes
  - Update RootNavigatorParamList to include Public stack with NavigatorScreenParams
  - _Requirements: 2.1, 3.1, 4.1, 6.1_

## Service Layer Implementation

- [x] 5. Implement metadata extraction API endpoint
  - Create api/extract-metadata.ts file for Vercel serverless function
  - Write handler function accepting POST requests with url in body
  - Implement extractOGTag helper function using regex to parse Open Graph meta tags from HTML
  - Implement extractTag helper function to extract standard HTML tags (title)
  - Implement extractPrice helper function to parse schema.org price data from HTML
  - Write fetch logic with User-Agent header and 5 second timeout to get HTML from URL
  - Parse HTML to extract title (og:title or title tag), imageUrl (og:image), price (schema.org), description (og:description)
  - Return JSON response with success boolean and metadata object or error message
  - Add error handling for invalid URLs, network errors, and parsing failures
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 6. Implement list service for database operations
  - Create src/services/listService.ts file
  - Import supabase client from src/lib/supabase.ts
  - Implement createList function: generate random 32-char share token using crypto, insert list record with userId, title, shareToken, return list object
  - Implement getUserLists function: query lists table where creator_id = userId, join count of list_items, return ListSummary array ordered by created_at desc
  - Implement getListById function: query lists table by id with list_items joined, return List with items or null
  - Implement getListByShareToken function: query lists table by share_token, join list_items and creator email, return SharedList with creatorName or null
  - Implement updateListTitle function: update lists table set title where id = listId
  - Implement deleteList function: delete from lists table where id = listId (cascade deletes items and saved_lists)
  - Implement addItem function: get max position from list_items for listId, insert list_item with url and position + 1, return ListItem
  - Implement updateItem function: update list_items table with partial updates where id = itemId
  - Implement deleteItem function: delete from list_items where id = itemId
  - Implement reorderItems function: update position for each itemId in array using transaction
  - Implement getListItems function: query list_items where list_id = listId ordered by position
  - Implement generateShareToken function: generate new random token, update lists table, return token
  - Implement saveList function: insert into saved_lists table (user_id, list_id, saved_at)
  - Implement unsaveList function: delete from saved_lists where user_id and list_id match
  - Implement getSavedLists function: query saved_lists joined with lists and creator info, return SavedListSummary array
  - Implement isListSaved function: query saved_lists where user_id and list_id match, return boolean
  - Add error handling and TypeScript types for all functions
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 4.2, 4.3, 4.4, 4.6, 4.7, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 7. Implement metadata extraction service
  - Create src/services/metadataService.ts file
  - Import EXPO_PUBLIC_APP_URL from environment or use fallback
  - Implement extractMetadata function: validate URL format, call /api/extract-metadata endpoint with POST request, parse response JSON
  - Add timeout handling (5 seconds) for API call
  - Return ProductMetadata object with success true/false
  - On failure return null values with success false to allow manual entry
  - Add error handling for network errors, invalid responses, CORS issues
  - Write helper function isValidUrl using URL constructor to validate URL format
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

## Custom Hooks

- [x] 8. Create useList hook for list management
  - Create src/hooks/useList.ts file
  - Import listService and metadataService
  - Define useList hook accepting optional listId parameter
  - Implement state management for list, items, loading, error using useState
  - Implement useEffect to fetch list and items when listId changes
  - Implement createList function: call listService.createList, return new listId, handle errors
  - Implement updateTitle function: call listService.updateListTitle, update local state, handle errors
  - Implement deleteList function: call listService.deleteList, handle errors
  - Implement addItem function: validate URL with isValidUrl, call listService.addItem, optimistically add to items state, fetch metadata in background using metadataService.extractMetadata, update item with metadata when available, handle errors
  - Implement updateItem function: call listService.updateItem, update local state optimistically, handle errors
  - Implement deleteItem function: call listService.deleteItem, remove from local state optimistically, handle errors
  - Implement reorderItems function: call listService.reorderItems, update local state optimistically, handle errors
  - Implement generateShareLink function: call listService.generateShareToken, return full URL with app domain + /list/ + token
  - Return object with all state and functions
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.2, 7.1, 7.2_

- [x] 9. Create useSavedLists hook for dashboard
  - Create src/hooks/useSavedLists.ts file
  - Import listService and useAuth context
  - Define useSavedLists hook
  - Implement state for savedLists, loading, error using useState
  - Implement useEffect to fetch saved lists when user is authenticated
  - Implement refresh function: call listService.getSavedLists with user.id, update state, handle errors
  - Implement saveList function: call listService.saveList with userId and listId, refresh saved lists, handle errors
  - Implement unsaveList function: call listService.unsaveList, update local state optimistically, handle errors
  - Implement isListSaved function: check if listId exists in savedLists array, return boolean
  - Return object with savedLists, loading, error, saveList, unsaveList, isListSaved, refresh
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 10. Create useMetadata hook
  - Create src/hooks/useMetadata.ts file
  - Import metadataService
  - Define useMetadata hook
  - Implement state for loading, error using useState
  - Implement extractMetadata function: set loading true, call metadataService.extractMetadata, set loading false, return ProductMetadata, handle errors
  - Return object with extractMetadata, loading, error
  - _Requirements: 7.1, 7.2, 7.3_

## Screen Components

- [x] 11. Create MyListsScreen component
  - Create src/screens/MyListsScreen.tsx file
  - Import useAuth, useList, navigation types, theme
  - Implement MyListsScreen functional component with navigation prop
  - Use useAuth to get current user
  - Use custom hook or direct listService call to fetch user's lists on mount
  - Implement state for lists array, loading, error
  - Render SafeAreaView with ScrollView or FlatList
  - Display "Create New List" button at top using TouchableOpacity styled with theme colors
  - Render FlatList of ListSummary items showing title, item count, creation date (formatted), share icon
  - Implement onPress for each list item to navigate to ListDetail screen with listId
  - Implement swipeable delete functionality with confirmation Alert
  - Render empty state when lists array is empty: centered view with icon, text "You haven't created any lists yet", CTA button "Create your first Christmas list"
  - Render LoadingIndicator when loading
  - Render ErrorMessage when error occurs
  - Add pull-to-refresh functionality with RefreshControl
  - Style with theme spacing, colors, borderRadius, shadows for cards
  - _Requirements: 1.6, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Create DashboardScreen component
  - Create src/screens/DashboardScreen.tsx file
  - Import useSavedLists hook, navigation types, theme
  - Implement DashboardScreen functional component with navigation prop
  - Use useSavedLists hook to get savedLists, loading, error, unsaveList, refresh
  - Render SafeAreaView with FlatList
  - Render FlatList of SavedListSummary items showing creator name, list title, item count, saved date
  - Implement onPress to navigate to SharedListView screen with shareToken parameter
  - Implement swipeable unsave functionality with confirmation
  - Render empty state: centered view with icon, text "No saved lists yet", subtext "When someone shares a list with you, you can save it here"
  - Render LoadingIndicator when loading
  - Render ErrorMessage when error occurs
  - Add pull-to-refresh with RefreshControl calling refresh function
  - Style with theme for consistent card layout
  - _Requirements: 4.4, 4.5, 4.6, 4.7_

- [x] 13. Create CreateListScreen component
  - Create src/screens/CreateListScreen.tsx file
  - Import useList hook, navigation, theme
  - Implement CreateListScreen functional component
  - Use useList hook to get createList function
  - Implement state for title input using useState
  - Render SafeAreaView with KeyboardAvoidingView
  - Render TextInput for list title with placeholder "e.g., Christmas 2025 Wish List", themed styling
  - Render "Create List" button (TouchableOpacity) styled as primary action
  - Implement onPress: validate title not empty, call createList with title, navigate to EditList screen with returned listId
  - Display error message if title is empty or creation fails
  - Add loading state during creation
  - Style input with theme colors, spacing, borderRadius
  - _Requirements: 1.1, 1.2_

- [ ] 14. Create EditListScreen component
  - Create src/screens/EditListScreen.tsx file
  - Import useList, useMetadata hooks, navigation, route, theme, types
  - Implement EditListScreen functional component with route and navigation props
  - Extract listId from route.params
  - Use useList hook with listId to get list, items, addItem, updateItem, deleteItem, reorderItems, generateShareLink
  - Implement state for urlInput, shareLink, showShareLink using useState
  - Render SafeAreaView with KeyboardAvoidingView and ScrollView
  - Display list title at top (read-only or editable)
  - Render TextInput for URL input with placeholder "Paste product link here", themed styling
  - Render "Add Item" button that calls addItem with urlInput, clears input, shows loading state during metadata fetch
  - Render FlatList of items with drag-to-reorder functionality (react-native-draggable-flatlist if needed, or simple list)
  - For each item render: thumbnail image (or placeholder), title (editable TextInput), price (editable), notes (editable), delete button
  - Implement inline editing: onChangeText updates local state, onBlur calls updateItem
  - Implement delete with confirmation Alert calling deleteItem
  - Render "Generate Share Link" button at bottom calling generateShareLink, display link in copyable TextInput with copy button
  - Handle loading states for each operation
  - Display error messages using ErrorMessage component
  - Style with theme for card-based item layout, spacing, colors
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Create ListDetailScreen component
  - Create src/screens/ListDetailScreen.tsx file
  - Import listService, navigation, route, theme
  - Implement ListDetailScreen functional component with route and navigation props
  - Extract listId from route.params
  - Fetch list and items on mount using listService.getListById
  - Implement state for list, items, loading, error
  - Render SafeAreaView with ScrollView
  - Display list title as header
  - Render share link with copy button at top
  - Render "Edit List" button navigating to EditList screen
  - Display FlatList of items in read-only mode: image, title, price, notes
  - Each item title is a link (Text with onPress) opening URL in browser using Linking.openURL
  - Render LoadingIndicator when loading
  - Render ErrorMessage on error
  - Style consistently with EditListScreen but without edit controls
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.4_

- [ ] 16. Create SharedListViewScreen component
  - Create src/screens/SharedListViewScreen.tsx file
  - Import listService, useSavedLists, useAuth, navigation, route, theme, Linking
  - Implement SharedListViewScreen functional component with route and navigation props
  - Extract shareToken from route.params
  - Fetch shared list on mount using listService.getListByShareToken(shareToken)
  - Implement state for sharedList, loading, error
  - Use useAuth to check if user is authenticated
  - Use useSavedLists to get isListSaved and saveList functions
  - Render SafeAreaView with ScrollView
  - Display creator name and list title as header
  - Render "Save to My Dashboard" button if not saved, "Saved ✓" if already saved
  - OnPress save button: check if authenticated, if not navigate to Login screen with return intent, if yes call saveList, update button state
  - Display FlatList of items: image thumbnail, title (clickable), price, notes/description
  - Implement onPress for item titles to open URL in browser using Linking.openURL with new tab
  - Handle "List not found" error with custom error message and link to sign up
  - Render LoadingIndicator when loading
  - Render ErrorMessage for other errors
  - Style with theme for public-facing design, attractive layout for gift viewing
  - _Requirements: 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.8_

## Navigation Updates

- [x] 17. Update TabNavigator for new screens
  - Open src/navigation/TabNavigator.tsx file
  - Replace "Home" tab with "MyLists" tab: update name to "MyLists", component to MyListsScreen, icon to "list" (list-outline), label to "My Lists"
  - Replace "Contacts" tab with "Dashboard" tab: update name to "Dashboard", component to DashboardScreen, icon to "albums" (albums-outline), label to "Dashboard"
  - Keep Settings tab unchanged
  - Import MyListsScreen and DashboardScreen components
  - Update screenOptions for consistent styling with theme
  - _Requirements: 1.1, 4.1, 6.1_

- [ ] 18. Update RootNavigator for public and main stacks
  - Open src/navigation/RootNavigator.tsx file
  - Import navigation types: PublicStackParamList, MainStackParamList
  - Create PublicStack navigator using createNativeStackNavigator<PublicStackParamList>
  - Add SharedListView screen to PublicStack with path "list/:shareToken"
  - Create MainStack navigator using createNativeStackNavigator<MainStackParamList>
  - Add Tabs screen (TabNavigator), CreateList screen, EditList screen, ListDetail screen to MainStack
  - Update root navigator to conditionally render: PublicStack (always available), AuthStack (when not authenticated), MainStack (when authenticated)
  - Configure deep linking for public routes: SharedListView with "list/:shareToken" pattern
  - Import all new screen components
  - Set screen options for modals (CreateList as modal on iOS)
  - _Requirements: 2.1, 3.1, 5.7, 5.8_

- [ ] 19. Configure deep linking for share URLs
  - Open App.tsx file
  - Import linking configuration from React Navigation
  - Define linking config object with prefixes: production URL, development URL, custom scheme
  - Configure screens mapping: Public.SharedListView → "list/:shareToken"
  - Pass linking prop to NavigationContainer
  - Test deep linking with example URL format: https://yourapp.vercel.app/list/abc123
  - _Requirements: 2.1, 2.4, 3.1_

## UI Components

- [ ] 20. Create ListItemCard component
  - Create src/components/ListItemCard.tsx file
  - Define props interface: item (ListItem), onPress (optional), onEdit (optional), onDelete (optional), editable (boolean)
  - Implement ListItemCard functional component
  - Render View container with card styling (shadow, borderRadius, padding)
  - Render Image component for item.imageUrl with fixed dimensions, fallback to placeholder icon if null
  - Render item title as Text (or TextInput if editable), styled with theme typography
  - Render price formatted as currency if not null
  - Render notes/description if not null
  - If editable, render edit icon button calling onEdit
  - If editable, render delete icon button calling onDelete with confirmation
  - If not editable and URL exists, make entire card or title touchable with onPress
  - Style with theme colors, spacing, borderRadius for consistent card design
  - Handle image loading errors with placeholder
  - _Requirements: 1.6, 3.3, 7.5_

- [ ] 21. Create ShareLinkDisplay component
  - Create src/components/ShareLinkDisplay.tsx file
  - Define props interface: shareLink (string), onCopy (optional callback)
  - Implement ShareLinkDisplay functional component
  - Import Clipboard from react-native or @react-native-clipboard/clipboard
  - Render View container with border and background color
  - Render Text showing shareLink in selectable format, or truncated with ellipsis
  - Render "Copy Link" button (TouchableOpacity with copy icon)
  - Implement onPress: copy shareLink to clipboard using Clipboard.setString, show success feedback (Toast or Alert), call onCopy callback if provided
  - Add visual feedback on copy (change button color or text briefly)
  - Style with theme for secondary actions, spacing, colors
  - _Requirements: 2.2, 2.3_

- [ ] 22. Create EmptyState component
  - Create src/components/EmptyState.tsx file
  - Define props interface: icon (Ionicons name), title (string), message (string), actionLabel (optional string), onAction (optional callback)
  - Implement EmptyState functional component
  - Render centered View container
  - Render Ionicons icon with large size and secondary color
  - Render title Text with theme.typography.headline styling
  - Render message Text with theme.typography.body and secondary color
  - If actionLabel and onAction provided, render primary button calling onAction
  - Style with theme spacing for vertical layout, centered alignment
  - _Requirements: 1.1, 4.1, 6.1_

## Testing

- [ ] 23. Write unit tests for listService
  - Create src/services/__tests__/listService.test.ts file
  - Mock supabase client methods
  - Write test: createList generates unique share token and inserts list record
  - Write test: getUserLists returns lists with item counts for authenticated user
  - Write test: getListByShareToken returns list with items and creator info
  - Write test: addItem increments position correctly
  - Write test: deleteList cascades to items and saved_lists
  - Write test: saveList creates saved_lists record
  - Write test: isListSaved returns correct boolean
  - Test error handling for database errors
  - _Requirements: 1.1, 1.9, 2.1, 4.2, 4.3, 6.2, 6.6_

- [ ] 24. Write unit tests for metadataService
  - Create src/services/__tests__/metadataService.test.ts file
  - Mock fetch API
  - Write test: extractMetadata successfully parses Open Graph tags from HTML
  - Write test: extractMetadata extracts price from schema.org data
  - Write test: extractMetadata returns success false on network error
  - Write test: extractMetadata handles timeout after 5 seconds
  - Write test: isValidUrl validates HTTP/HTTPS URLs correctly
  - Write test: isValidUrl rejects invalid URLs
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 25. Write integration tests for MyListsScreen
  - Create src/screens/__tests__/MyListsScreen.test.tsx file
  - Mock navigation and listService
  - Write test: renders empty state when no lists exist
  - Write test: renders list of user's lists with correct data
  - Write test: navigates to CreateList on button press
  - Write test: navigates to ListDetail on list item press
  - Write test: shows confirmation before deleting list
  - Write test: displays loading indicator while fetching
  - Write test: displays error message on fetch failure
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 26. Write integration tests for SharedListViewScreen
  - Create src/screens/__tests__/SharedListViewScreen.test.tsx file
  - Mock listService, useAuth, useSavedLists
  - Write test: renders shared list items without authentication
  - Write test: displays "Save to Dashboard" button when not authenticated
  - Write test: navigates to Login when save pressed without auth
  - Write test: saves list to dashboard when authenticated
  - Write test: displays "Saved" state when list already saved
  - Write test: shows "List not found" error for invalid share token
  - Write test: opens product URL on item click
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.8_

## Deployment

- [ ] 27. Update environment configuration
  - Add EXPO_PUBLIC_APP_URL to .env file with production URL (https://yourapp.vercel.app)
  - Update vercel.json with rewrite rules for /list/:shareToken → /index.html
  - Add EXPO_PUBLIC_APP_URL to Vercel environment variables
  - Verify Supabase environment variables are set in Vercel
  - _Requirements: 2.1, 3.1_

- [ ] 28. Build and deploy to Vercel
  - Run npx expo export -p web to build web bundle
  - Test built bundle locally with serve dist command
  - Verify deep linking works with /list/:shareToken URLs in local build
  - Deploy to Vercel using vercel --prod command
  - Test production deployment with real share URLs
  - Verify all screens render correctly on web
  - Test responsive layout on mobile and desktop browsers
  - _Requirements: All_

- [ ] 29. End-to-end testing on production
  - Test user flow: Sign up → Create list → Add items via URLs → Generate share link
  - Test metadata extraction with 5+ different e-commerce sites (Amazon, Etsy, Target, etc.)
  - Test sharing flow: Copy link → Open in incognito → Verify public view works
  - Test save flow: Open shared link → Save to dashboard → Verify appears in dashboard
  - Test editing: Edit list items → Verify updates reflected in shared view
  - Test deletion: Delete list → Verify share link shows error
  - Test error states: Invalid URLs, network failures, missing lists
  - Test on multiple devices and browsers
  - _Requirements: All_