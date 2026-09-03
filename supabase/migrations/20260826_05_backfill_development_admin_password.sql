-- Development credentials must be provisioned outside source control.
-- This migration intentionally clears any committed hash instead of storing one.

UPDATE profiles
SET password_hash = NULL
WHERE email = 'admin@crisismesh.dev'
  AND password_hash IS NOT NULL;