-- Backfill the development admin password for databases where the seed ran
-- before password-based authentication was added.

UPDATE profiles
SET password_hash = '$2b$10$aXA.xr7Gt9icDZ37XRlvQOiFOJZxOfd7GXZJCif1AKOF47LuxqvZ2'
WHERE email = 'admin@crisismesh.dev'
  AND password_hash IS NULL;