-- Migration: Create Christmas List Sharing Tables
-- Description: Creates lists, list_items, and saved_lists tables with proper indexes and constraints

-- Create lists table
CREATE TABLE IF NOT EXISTS public.lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    share_token VARCHAR(32) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create list_items table
CREATE TABLE IF NOT EXISTS public.list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(500),
    image_url TEXT,
    price DECIMAL(10, 2),
    notes TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_lists table
CREATE TABLE IF NOT EXISTS public.saved_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, list_id)
);

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_lists_share_token ON public.lists(share_token);
CREATE INDEX IF NOT EXISTS idx_lists_creator_id ON public.lists(creator_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON public.list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_saved_lists_user_id ON public.saved_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_lists_list_id ON public.saved_lists(list_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on lists table
CREATE TRIGGER update_lists_updated_at
    BEFORE UPDATE ON public.lists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_lists ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.lists TO authenticated;
GRANT ALL ON public.list_items TO authenticated;
GRANT ALL ON public.saved_lists TO authenticated;
GRANT SELECT ON public.lists TO anon;
GRANT SELECT ON public.list_items TO anon;
