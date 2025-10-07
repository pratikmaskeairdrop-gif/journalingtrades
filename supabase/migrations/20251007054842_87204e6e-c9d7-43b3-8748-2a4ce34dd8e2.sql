-- Fix foreign key reference: trades should reference user_profiles instead of auth.users
-- This follows Supabase best practices of having a single-point reference to auth.users

-- Drop the existing foreign key constraint
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_user_id_fkey;

-- Add new foreign key constraint referencing user_profiles
ALTER TABLE trades ADD CONSTRAINT trades_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;