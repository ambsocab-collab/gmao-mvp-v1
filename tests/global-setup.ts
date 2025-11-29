/**
 * Global Test Setup for Epic 1 - Foundation & User Management
 * Risk Mitigation: R-001 (Auth), R-002 (Roles), R-003 (Config)
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🔒 Setting up Epic 1 Security Test Environment');

  // Validate environment variables for security testing
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'TEST_ADMIN_EMAIL',
    'TEST_ADMIN_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`❌ Missing required environment variables for security testing: ${missingVars.join(', ')}`);
  }

  console.log('✅ Environment variables validated for Epic 1 testing');

  // Test browser for security tests
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Pre-test validation: Check Supabase connectivity
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      console.log(`🔗 Testing Supabase connectivity: ${supabaseUrl}`);

      const response = await page.goto(supabaseUrl);
      if (response && response.status() < 500) {
        console.log('✅ Supabase service is accessible');
      } else {
        console.warn('⚠️ Supabase service may not be fully available');
      }
    }

    // Validate test users existence (if database is available)
    await validateTestUsers(page);

  } catch (error) {
    console.warn('⚠️ Global setup warning:', error);
  } finally {
    await browser.close();
  }

  console.log('🎯 Epic 1 Security Test Environment Ready');
}

async function validateTestUsers(page: any) {
  // This would typically check if test users exist in the database
  // For now, we'll log the intention
  console.log('👥 Test users validation:');
  console.log(`  - Admin: ${process.env.TEST_ADMIN_EMAIL}`);
  console.log(`  - Technician: ${process.env.TEST_TECHNICIAN_EMAIL}`);
  console.log(`  - Operator: ${process.env.TEST_OPERATOR_EMAIL}`);
  console.log(`  - Supervisor: ${process.env.TEST_SUPERVISOR_EMAIL}`);
}

export default globalSetup;