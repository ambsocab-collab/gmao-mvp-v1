/**
 * API Validation Helper
 *
 * Utility functions for validating API endpoints that should exist
 * for infrastructure testing and future GMAO application functionality.
 */

import { APIRequestContext, expect } from '@playwright/test';

export class APIValidationHelper {
  constructor(private request: APIRequestContext) {}

  /**
   * Validates that a required API endpoint exists and returns expected response
   */
  async validateEndpoint(
    endpoint: string,
    expectedStatus: number = 200,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<{ exists: boolean; status: number; response?: any }> {
    try {
      let response;

      switch (method) {
        case 'GET':
          response = await this.request.get(endpoint);
          break;
        case 'POST':
          response = await this.request.post(endpoint, { data: body });
          break;
        case 'PUT':
          response = await this.request.put(endpoint, { data: body });
          break;
        case 'DELETE':
          response = await this.request.delete(endpoint);
          break;
      }

      return {
        exists: true,
        status: response.status(),
        response: response.status() === 200 ? await response.json() : undefined
      };
    } catch (error) {
      return {
        exists: false,
        status: 0
      };
    }
  }

  /**
   * Validates infrastructure-specific endpoints
   */
  async validateInfrastructureEndpoints() {
    const endpoints = [
      { path: '/api/validate/tailwind', expected: 200 },
      { path: '/api/validate/shadcn', expected: 200 },
      { path: '/api/validate/lucide', expected: 200 },
      { path: '/api/validate/tanstack-query', expected: 200 },
      { path: '/api/validate/zustand', expected: 200 },
      { path: '/api/validate/integration', expected: 200 },
      { path: '/api/env-validation', expected: 200 },
      { path: '/api/architecture-validation', expected: 200 },
      { path: '/api/type-check', expected: 200, method: 'POST' },
      { path: '/api/build', expected: 200, method: 'POST' }
    ];

    const results = await Promise.all(
      endpoints.map(async ({ path, expected, method }) => {
        const result = await this.validateEndpoint(path, expected, method as any);
        return { path, expected, actual: result };
      })
    );

    return {
      total: endpoints.length,
      passing: results.filter(r => r.actual.status === r.expected).length,
      failing: results.filter(r => r.actual.status !== r.expected).length,
      details: results
    };
  }

  /**
   * Validates that required environment variables are available
   */
  async validateEnvironmentVariables() {
    const response = await this.validateEndpoint('/api/env-validation');

    if (!response.exists || response.status !== 200) {
      return {
        valid: false,
        missing: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
        present: []
      };
    }

    const envValidation = response.response;
    return {
      valid: envValidation.all_present,
      missing: envValidation.missing_vars || [],
      present: envValidation.present_vars || []
    };
  }

  /**
   * Validates build process works without errors
   */
  async validateBuildProcess() {
    const response = await this.validateEndpoint(
      '/api/build',
      200,
      'POST',
      { command: 'npm run build' }
    );

    if (!response.exists || response.status !== 200) {
      return {
        success: false,
        errors: ['Build endpoint not available'],
        warnings: [],
        duration: 0,
        outputSize: 0
      };
    }

    const buildResult = response.response;
    return {
      success: buildResult.success,
      errors: buildResult.errors || [],
      warnings: buildResult.warnings || [],
      duration: buildResult.duration || 0,
      outputSize: buildResult.outputSize || 0
    };
  }

  /**
   * Validates TypeScript compilation
   */
  async validateTypeScript() {
    const response = await this.validateEndpoint(
      '/api/type-check',
      200,
      'POST',
      { command: 'npx tsc --noEmit --strict' }
    );

    if (!response.exists || response.status !== 200) {
      return {
        success: false,
        strictMode: false,
        errors: ['TypeScript check endpoint not available'],
        warnings: [],
        errorCount: 1
      };
    }

    const typeCheck = response.response;
    return {
      success: typeCheck.success,
      strictMode: typeCheck.strictMode || false,
      errors: typeCheck.errors || [],
      warnings: typeCheck.warnings || [],
      errorCount: typeCheck.errorCount || 0
    };
  }

  /**
   * Validates project structure exists
   */
  async validateProjectStructure(requiredPaths: string[]) {
    const results = await Promise.all(
      requiredPaths.map(async (path) => {
        const response = await this.validateEndpoint(
          `/api/check-file?path=${encodeURIComponent(path)}`
        );

        return {
          path,
          exists: response.status === 200,
          status: response.status
        };
      })
    );

    return {
      total: requiredPaths.length,
      existing: results.filter(r => r.exists).length,
      missing: results.filter(r => !r.exists),
      details: results
    };
  }

  /**
   * Comprehensive infrastructure validation
   */
  async runFullInfrastructureValidation() {
    const [
      endpoints,
      environment,
      build,
      typescript
    ] = await Promise.all([
      this.validateInfrastructureEndpoints(),
      this.validateEnvironmentVariables(),
      this.validateBuildProcess(),
      this.validateTypeScript()
    ]);

    return {
      timestamp: new Date().toISOString(),
      overall: {
        endpoints: endpoints.passing === endpoints.total,
        environment: environment.valid,
        build: build.success,
        typescript: typescript.success
      },
      details: {
        endpoints,
        environment,
        build,
        typescript
      },
      readyForDevelopment:
        endpoints.passing === endpoints.total &&
        environment.valid &&
        build.success &&
        typescript.success
    };
  }

  /**
   * Future GMAO application validation (preparation for ATDD)
   */
  async validateGmaoEndpoints() {
    const gmaoEndpoints = [
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/register',
      '/api/assets',
      '/api/orders',
      '/api/users/profile',
      '/api/health-check'
    ];

    const results = await Promise.all(
      gmaoEndpoints.map(async (path) => {
        const result = await this.validateEndpoint(path, 404); // Expect 404 initially
        return {
          path,
          available: result.status !== 0,
          status: result.status,
          readyForImplementation: result.status === 404 // 404 means route exists but not implemented
        };
      })
    );

    return {
      total: gmaoEndpoints.length,
      available: results.filter(r => r.available).length,
      readyForImplementation: results.filter(r => r.readyForImplementation).length,
      details: results
    };
  }
}