-- Development credentials must be provisioned outside source control.
-- This migration intentionally avoids any committed hash.

UPDATE profiles
SET password_hash = NULL
WHERE email = 'admin@crisismesh.dev';