# Supabase Database Migrations

This directory contains SQL migrations for the Christmas List Sharing feature.

## How to Run Migrations

Since the Supabase CLI is not installed, you can run these migrations directly in the Supabase dashboard:

### Option 1: Using Supabase Dashboard SQL Editor

1. Go to your Supabase project dashboard: https://app.supabase.com/project/twsajlcgbnnqnypknjfy
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order:
   - First run: `001_create_christmas_list_tables.sql`
   - Then run: `002_create_rls_policies.sql`
5. Click **Run** for each migration

### Option 2: Using the Supabase CLI (if you install it later)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref twsajlcgbnnqnypknjfy

# Run migrations
supabase db push
```

## Migration Files

### 001_create_christmas_list_tables.sql
Creates the core database schema:
- `lists` table - Stores user-created Christmas lists
- `list_items` table - Stores individual items in lists
- `saved_lists` table - Stores which users have saved which lists
- Indexes for performance
- Updated_at trigger for lists table
- Enables RLS on all tables
- Grants necessary permissions

### 002_create_rls_policies.sql
Creates Row Level Security policies:
- **Lists policies**: Users can manage their own lists, anyone can view by share token
- **List items policies**: Users can manage their own list items, anyone can view
- **Saved lists policies**: Users can save/unsave lists to their dashboard

## Verifying Migrations

After running the migrations, verify they were successful:

1. Go to **Table Editor** in Supabase dashboard
2. You should see three new tables:
   - `lists`
   - `list_items`
   - `saved_lists`
3. Go to **Authentication** > **Policies** to verify RLS policies are active

## Testing the Schema

You can test the schema with sample data:

```sql
-- Insert a test list (replace 'your-user-id' with an actual user ID from auth.users)
INSERT INTO public.lists (creator_id, title, share_token)
VALUES ('your-user-id', 'My Christmas 2025 List', 'test-share-token-12345678901234567890');

-- Insert a test item
INSERT INTO public.list_items (list_id, url, title, position)
SELECT id, 'https://example.com/product', 'Test Product', 1
FROM public.lists WHERE share_token = 'test-share-token-12345678901234567890';

-- Query to verify
SELECT l.title, li.title as item_title
FROM public.lists l
LEFT JOIN public.list_items li ON li.list_id = l.id
WHERE l.share_token = 'test-share-token-12345678901234567890';
```

## Rollback (if needed)

If you need to rollback these migrations:

```sql
-- Drop tables (this will delete all data!)
DROP TABLE IF EXISTS public.saved_lists CASCADE;
DROP TABLE IF EXISTS public.list_items CASCADE;
DROP TABLE IF EXISTS public.lists CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
```

## Next Steps

After successfully running these migrations:
1. Proceed to implement the TypeScript type definitions (Task 3)
2. Implement the service layer (Tasks 5-7)
3. Create custom hooks (Tasks 8-10)
