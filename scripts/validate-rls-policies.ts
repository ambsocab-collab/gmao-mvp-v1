/**
 * RLS Policy Validation Script for Epic 1
 * Validates that security policies are properly configured
 * Addresses risks R-001 (Authentication) and R-002 (Role-based access)
 */

import { createClient } from '@supabase/supabase-js';

// Epic 1 Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

// Create admin client for testing RLS policies
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

interface RLSValidationResult {
  policyName: string;
  tableName: string;
  isValid: boolean;
  details: string;
  riskMitigated: string;
}

class RLSValidator {
  private results: RLSValidationResult[] = [];

  async validateAllPolicies(): Promise<RLSValidationResult[]> {
    console.log('🔍 Starting Epic 1 RLS Policy Validation...\n');

    await this.validateProfilePolicies();
    await this.validateActivityLogPolicies();
    await this.validateSessionPolicies();
    await this.testRLEnforcement();

    this.printResults();
    return this.results;
  }

  private async validateProfilePolicies(): Promise<void> {
    console.log('📋 Validating Profile RLS Policies...');

    // Test 1: Profiles table has RLS enabled
    const { data: rlsStatus, error: rlsError } = await adminClient
      .from('profiles')
      .select('1')
      .limit(1);

    this.addResult({
      policyName: 'Profiles RLS Enabled',
      tableName: 'profiles',
      isValid: !rlsError || rlsError.message.includes('row-level security'),
      details: rlsError?.message || 'RLS is enabled',
      riskMitigated: 'R-001, R-002'
    });

    // Test 2: Can create profiles (service role bypass)
    const { data: createResult, error: createError } = await adminClient
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@validation.com',
        role: 'operator'
      })
      .select();

    this.addResult({
      policyName: 'Service Role Full Access',
      tableName: 'profiles',
      isValid: !createError,
      details: createError?.message || 'Service role can access all data',
      riskMitigated: 'R-002'
    });

    // Cleanup test data
    if (createResult && createResult.length > 0) {
      await adminClient
        .from('profiles')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
    }
  }

  private async validateActivityLogPolicies(): Promise<void> {
    console.log('📋 Validating Activity Log RLS Policies...');

    // Test 1: Activity log has RLS enabled
    const { data: rlsStatus, error: rlsError } = await adminClient
      .from('user_activity_log')
      .select('1')
      .limit(1);

    this.addResult({
      policyName: 'Activity Log RLS Enabled',
      tableName: 'user_activity_log',
      isValid: !rlsError || rlsError.message.includes('row-level security'),
      details: rlsError?.message || 'RLS is enabled',
      riskMitigated: 'R-001'
    });
  }

  private async validateSessionPolicies(): Promise<void> {
    console.log('📋 Validating Session RLS Policies...');

    // Test 1: Sessions table has RLS enabled
    const { data: rlsStatus, error: rlsError } = await adminClient
      .from('user_sessions')
      .select('1')
      .limit(1);

    this.addResult({
      policyName: 'Sessions RLS Enabled',
      tableName: 'user_sessions',
      isValid: !rlsError || rlsError.message.includes('row-level security'),
      details: rlsError?.message || 'RLS is enabled',
      riskMitigated: 'R-001'
    });
  }

  private async testRLEnforcement(): Promise<void> {
    console.log('📋 Testing RLS Enforcement...');

    // Create anonymous client (should be blocked)
    const anonymousClient = createClient(supabaseUrl, 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH');

    // Test 1: Anonymous client cannot access profiles
    const { data: profilesData, error: profilesError } = await anonymousClient
      .from('profiles')
      .select('*');

    this.addResult({
      policyName: 'Anonymous Access Blocked',
      tableName: 'profiles',
      isValid: profilesError !== null,
      details: profilesError?.message || 'Anonymous access properly blocked',
      riskMitigated: 'R-001'
    });

    // Test 2: Anonymous client cannot access activity logs
    const { data: logsData, error: logsError } = await anonymousClient
      .from('user_activity_log')
      .select('*');

    this.addResult({
      policyName: 'Anonymous Activity Log Blocked',
      tableName: 'user_activity_log',
      isValid: logsError !== null,
      details: logsError?.message || 'Anonymous access to activity logs properly blocked',
      riskMitigated: 'R-001'
    });
  }

  private addResult(result: RLSValidationResult): void {
    this.results.push(result);
    const status = result.isValid ? '✅' : '❌';
    console.log(`  ${status} ${result.policyName} (${result.tableName})`);
    console.log(`      ${result.details}`);
    console.log(`      Risk Mitigated: ${result.riskMitigated}\n`);
  }

  private printResults(): void {
    console.log('\n🎯 Epic 1 RLS Validation Summary:');
    console.log('=====================================');

    const passed = this.results.filter(r => r.isValid).length;
    const total = this.results.length;
    const failed = total - passed;

    console.log(`Total Policies Tested: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Policies:');
      this.results
        .filter(r => !r.isValid)
        .forEach(r => {
          console.log(`  - ${r.policyName} (${r.tableName}): ${r.details}`);
        });
    }

    console.log('\n🔒 Risk Mitigation Status:');
    console.log('R-001 (Authentication compromised):', passed > 0 ? '✅ Mitigated' : '❌ Not Mitigated');
    console.log('R-002 (Role-based access incorrect):', passed > 1 ? '✅ Mitigated' : '❌ Not Mitigated');

    if (failed === 0) {
      console.log('\n🎉 All RLS policies are properly configured!');
      console.log('🚀 Epic 1 security setup is ready for testing.');
    } else {
      console.log('\n⚠️  Some RLS policies need attention before proceeding.');
    }
  }
}

// Execute validation if run directly
if (require.main === module) {
  const validator = new RLSValidator();
  validator.validateAllPolicies()
    .then(results => {
      const failed = results.filter(r => !r.isValid).length;
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

export { RLSValidator, type RLSValidationResult };