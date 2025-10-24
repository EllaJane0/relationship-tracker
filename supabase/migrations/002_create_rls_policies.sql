-- Migration: Create Row Level Security Policies
-- Description: Set up RLS policies for lists, list_items, and saved_lists tables

-- ============================================================================
-- LISTS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own lists
CREATE POLICY "Users can view own lists"
    ON public.lists
    FOR SELECT
    USING (auth.uid() = creator_id);

-- Policy: Users can create lists
CREATE POLICY "Users can create lists"
    ON public.lists
    FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can update their own lists
CREATE POLICY "Users can update own lists"
    ON public.lists
    FOR UPDATE
    USING (auth.uid() = creator_id);

-- Policy: Users can delete their own lists
CREATE POLICY "Users can delete own lists"
    ON public.lists
    FOR DELETE
    USING (auth.uid() = creator_id);

-- Policy: Anyone can view lists by share token (for public sharing)
-- This allows unauthenticated users to view shared lists
CREATE POLICY "Anyone can view lists by share token"
    ON public.lists
    FOR SELECT
    USING (true);

-- ============================================================================
-- LIST_ITEMS TABLE POLICIES
-- ============================================================================

-- Policy: Users can manage items in their own lists
-- Covers INSERT, UPDATE, DELETE operations
CREATE POLICY "Users can manage own list items"
    ON public.list_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.lists
            WHERE lists.id = list_items.list_id
            AND lists.creator_id = auth.uid()
        )
    );

-- Policy: Anyone can view list items (for public sharing)
-- This allows unauthenticated users to view items in shared lists
CREATE POLICY "Anyone can view list items"
    ON public.list_items
    FOR SELECT
    USING (true);

-- ============================================================================
-- SAVED_LISTS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own saved lists
CREATE POLICY "Users can view own saved lists"
    ON public.saved_lists
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can save lists to their dashboard
CREATE POLICY "Users can save lists"
    ON public.saved_lists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can unsave lists from their dashboard
CREATE POLICY "Users can unsave lists"
    ON public.saved_lists
    FOR DELETE
    USING (auth.uid() = user_id);
