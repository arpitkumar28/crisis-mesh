-- Correct the development admin password for databases that received the
-- earlier password backfill.

UPDATE profiles
SET password_hash = '$2b$10$aXA.xr7Gt9icDZ37XRlvQOiFOJZxOfd7GXZJCif1AKOF47LuxqvZ2'
WHERE email = 'admin@crisismesh.dev';