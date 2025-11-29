-- Seed data for Epic 1 testing environment
-- Creates test users with different roles for security testing

-- Insert test users (passwords are handled by Supabase Auth)
-- These will be created after authentication setup

-- Log the seed process
DO $$
BEGIN
  RAISE NOTICE 'Starting Epic 1 test data seeding...';
END $$;

-- Note: Actual user creation happens through Supabase Auth
-- The profiles will be automatically created when users sign up
-- This file contains additional test data

-- Sample data that will be populated after user creation:

-- Basic system configuration (placeholder tables for future epics)
-- These will be created in later migrations

SELECT 'Epic 1 test data seeding completed. User profiles will be created on first login.' as status;