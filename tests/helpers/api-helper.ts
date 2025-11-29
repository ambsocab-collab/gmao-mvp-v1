/**
 * API Helper for Epic 1 Testing
 * Provides standardized API client for security testing
 */

import { APIRequestContext } from '@playwright/test';

export function getApiClient(request: APIRequestContext) {
  const baseURL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000';

  return {
    async get(endpoint: string, options?: any) {
      return request.get(`${baseURL}${endpoint}`, options);
    },

    async post(endpoint: string, options?: any) {
      return request.post(`${baseURL}${endpoint}`, options);
    },

    async put(endpoint: string, options?: any) {
      return request.put(`${baseURL}${endpoint}`, options);
    },

    async delete(endpoint: string, options?: any) {
      return request.delete(`${baseURL}${endpoint}`, options);
    }
  };
}

/**
 * Test user management for Epic 1
 */
export class TestUserManager {
  private request: APIRequestContext;
  private tokens: Map<string, string> = new Map();

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Authenticate test user and store token
   */
  async authenticateUser(email: string, password: string, role: string): Promise<string> {
    const response = await this.request.post('/api/auth/login', {
      data: { email, password }
    });

    if (!response.ok()) {
      throw new Error(`Failed to authenticate ${role} user: ${email}`);
    }

    const token = (await response.json()).token;
    this.tokens.set(role, token);
    return token;
  }

  /**
   * Get stored token for role
   */
  getToken(role: string): string {
    const token = this.tokens.get(role);
    if (!token) {
      throw new Error(`No token found for role: ${role}`);
    }
    return token;
  }

  /**
   * Cleanup test data
   */
  async cleanup(): Promise<void> {
    this.tokens.clear();
  }
}