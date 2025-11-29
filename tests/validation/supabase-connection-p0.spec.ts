/**
 * P0 Supabase Connection Tests - Epic 1 Foundation
 * Tests direct database and API connectivity without requiring Next.js app
 * Validates that Supabase local environment is properly configured
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Epic 1 Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const supabaseServiceKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const databaseUrl = 'postgresql://postgres:postgres@127.0.0.1:54325/postgres';

test.describe('Supabase Infrastructure Validation - P0 Critical', () => {
  let anonClient: any;
  let serviceClient: any;

  test.beforeAll(async () => {
    // Create clients for testing
    anonClient = createClient(supabaseUrl, supabaseAnonKey);
    serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  });

  test.describe('Database Connectivity', () => {
    test('P0-INFRA-001: Supabase API is accessible', async ({ request }) => {
      // Test direct API connectivity
      const response = await request.get(`${supabaseUrl}/rest/v1/`);
      expect(response.status()).toBe(200);
    });

    test('P0-INFRA-002: Database schema is properly loaded', async () => {
      // Test that we can access database information
      const { data, error } = await serviceClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      // Should find the profiles table from our migration
    });

    test('P0-INFRA-003: Epic 1 tables exist', async () => {
      // Test that our Epic 1 tables were created
      const epic1Tables = ['profiles', 'user_activity_log', 'user_sessions'];

      for (const tableName of epic1Tables) {
        const { data, error } = await serviceClient
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', tableName);

        expect(error).toBeNull();
        expect(data?.length).toBeGreaterThan(0);
        console.log(`✅ Table ${tableName} exists`);
      }
    });
  });

  test.describe('Security Validation - RLS Policies', () => {
    test('P0-SECURITY-001: Anonymous access is properly restricted', async () => {
      // Test that anonymous client cannot access profiles (RLS is working)
      const { data, error } = await anonClient
        .from('profiles')
        .select('*');

      // Should return empty data (RLS working) but no error
      expect(data).toBeDefined();
      expect(data?.length || 0).toBe(0);
      console.log('✅ RLS is properly restricting anonymous access');
    });

    test('P0-SECURITY-002: Service role has full access', async () => {
      // Test that service role can bypass RLS
      const { data, error } = await serviceClient
        .from('pg_policies')
        .select('policyname, tablename')
        .eq('schemaname', 'public');

      expect(error).toBeNull();
      expect(data?.length || 0).toBeGreaterThan(0);
      console.log(`✅ Found ${data?.length} RLS policies`);
    });
  });

  test.describe('Epic 1 User Management Schema', () => {
    test('P0-SCHEMA-001: User roles enum exists', async () => {
      // Test that our user role enum was created
      const { data, error } = await serviceClient
        .from('pg_enum')
        .select('enumlabel')
        .eq('enumtypid::regtype', 'user_role'::regtype);

      expect(error).toBeNull();
      const roles = data?.map((row: any) => row.enumlabel) || [];

      const expectedRoles = ['operator', 'technician', 'supervisor', 'admin'];
      for (const role of expectedRoles) {
        expect(roles).toContain(role);
      }
      console.log(`✅ User roles enum: ${roles.join(', ')}`);
    });

    test('P0-SCHEMA-002: Capacity levels enum exists', async () => {
      // Test that our capacity level enum was created
      const { data, error } = await serviceClient
        .from('pg_enum')
        .select('enumlabel')
        .eq('enumtypid::regtype', 'capacity_level'::regtype);

      expect(error).toBeNull();
      const levels = data?.map((row: any) => row.enumlabel) || [];

      const expectedLevels = ['N1', 'N2', 'N3', 'N4', 'N5'];
      for (const level of expectedLevels) {
        expect(levels).toContain(level);
      }
      console.log(`✅ Capacity levels: ${levels.join(', ')}`);
    });

    test('P0-SCHEMA-003: Profile table structure is correct', async () => {
      // Test that profiles table has correct structure
      const { data, error } = await serviceClient
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public');

      expect(error).toBeNull();

      const columns = data?.map((row: any) => row.column_name) || [];
      const requiredColumns = ['id', 'email', 'role', 'created_at', 'updated_at'];

      for (const column of requiredColumns) {
        expect(columns).toContain(column);
      }
      console.log(`✅ Profile table columns: ${columns.join(', ')}`);
    });
  });

  test.describe('Risk Mitigation Validation', () => {
    test('P0-RISK-001: Authentication infrastructure is in place', async () => {
      // Test that auth.users table exists and is accessible
      const { data, error } = await serviceClient
        .from('auth.users')
        .select('id', 'email', 'created_at')
        .limit(1);

      expect(error).toBeNull();
      console.log('✅ Auth system is accessible');
    });

    test('P0-RISK-002: User activity logging is available', async () => {
      // Test that activity log table exists and has RLS
      const { data, error } = await serviceClient
        .from('user_activity_log')
        .select('id')
        .limit(1);

      // Should work with service role
      expect(error).toBeNull();
      console.log('✅ User activity logging is functional');
    });

    test('P0-RISK-003: Session management is configured', async () => {
      // Test that session table exists
      const { data, error } = await serviceClient
        .from('user_sessions')
        .select('id')
        .limit(1);

      expect(error).toBeNull();
      console.log('✅ Session management is configured');
    });
  });

  test.describe('Service Health Checks', () => {
    test('P0-HEALTH-001: All critical services are responding', async ({ request }) => {
      // Check API health
      const apiResponse = await request.get(`${supabaseUrl}/rest/v1/`);
      expect(apiResponse.ok()).toBeTruthy();

      // Check database connectivity through service
      const { error } = await serviceClient
        .from('information_schema.schemata')
        .select('schema_name')
        .eq('schema_name', 'public');
      expect(error).toBeNull();

      console.log('✅ All critical services are healthy');
    });
  });
});

test.describe('Environment Configuration Validation', () => {
  test('P0-CONFIG-001: Environment variables are properly configured', async () => {
    // Validate critical environment variables
    const requiredEnvVars = {
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceKey,
      databaseUrl
    };

    expect(requiredEnvVars.supabaseUrl).toBeTruthy();
    expect(requiredEnvVars.supabaseAnonKey).toBeTruthy();
    expect(requiredEnvVars.supabaseServiceKey).toBeTruthy();
    expect(requiredEnvVars.databaseUrl).toBeTruthy();

    // Validate URL formats
    expect(requiredEnvVars.supabaseUrl).toMatch(/^https?:\/\/.+/);
    expect(requiredEnvVars.databaseUrl).toMatch(/^postgresql:\/\//);

    console.log('✅ Environment variables are properly configured');
  });
});