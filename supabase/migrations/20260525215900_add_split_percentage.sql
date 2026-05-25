-- Migration to add split_percentage to profiles
-- By default, both users have 50%, meaning they split expenses equally.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS split_percentage INTEGER NOT NULL DEFAULT 50 CHECK (split_percentage >= 0 AND split_percentage <= 100);
