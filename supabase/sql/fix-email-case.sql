-- Run this in Supabase Dashboard → SQL Editor (one-time fix for login with any email case)
-- Normalizes existing user emails to lowercase so sign-in works regardless of case.

UPDATE auth.users
SET email = lower(email)
WHERE email != lower(email);
