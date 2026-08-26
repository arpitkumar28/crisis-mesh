-- Add password_hash column to profiles table for authentication
-- This migration adds support for password-based authentication

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Add index for active users
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
