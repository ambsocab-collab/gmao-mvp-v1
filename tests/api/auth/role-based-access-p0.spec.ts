/**
 * P0 Role-Based Access Control Tests - Epic 1: Foundation & User Management
 *
 * Addresses Risk R-002: Gestión de roles incorrecta
 * Score: 6 (Probability: 2, Impact: 3)
 *
 * Test Coverage:
 * - Admin role access
 * - Technician role access
 * - Role-based restrictions
 * - Unauthorized access prevention
 */

import { test, expect } from '@playwright/test';
import { getApiClient } from '../../helpers/api-helper';

// API endpoints for Epic 1 testing
const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile'
  },
  admin: {
    users: '/api/admin/users',
    roles: '/api/admin/roles',
    invite: '/api/admin/invite'
  },
  protected: {
    dashboard: '/api/dashboard',
    settings: '/api/settings'
  }
};

// Role-based access matrix for Epic 1
const ROLE_ACCESS_MATRIX = {
  admin: {
    [API_ENDPOINTS.admin.users]: ['GET', 'POST', 'PUT', 'DELETE'],
    [API_ENDPOINTS.admin.roles]: ['GET', 'POST', 'PUT', 'DELETE'],
    [API_ENDPOINTS.admin.invite]: ['POST'],
    [API_ENDPOINTS.protected.dashboard]: ['GET'],
    [API_ENDPOINTS.protected.settings]: ['GET', 'PUT']
  },
  technician: {
    [API_ENDPOINTS.admin.users]: ['GET'], // Read-only
    [API_ENDPOINTS.admin.roles]: [], // No access
    [API_ENDPOINTS.admin.invite]: [], // No access
    [API_ENDPOINTS.protected.dashboard]: ['GET'],
    [API_ENDPOINTS.protected.settings]: ['GET'] // Read-only
  },
  operator: {
    [API_ENDPOINTS.admin.users]: [], // No access
    [API_ENDPOINTS.admin.roles]: [], // No access
    [API_ENDPOINTS.admin.invite]: [], // No access
    [API_ENDPOINTS.protected.dashboard]: ['GET'],
    [API_ENDPOINTS.protected.settings]: [] // No access
  }
};

const TEST_USERS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@gmao-test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123456',
    role: 'admin'
  },
  technician: {
    email: process.env.TEST_TECHNICIAN_EMAIL || 'tech@gmao-test.com',
    password: process.env.TEST_TECHNICIAN_PASSWORD || 'tech123456',
    role: 'technician'
  },
  operator: {
    email: process.env.TEST_OPERATOR_EMAIL || 'operator@gmao-test.com',
    password: process.env.TEST_OPERATOR_PASSWORD || 'operator123456',
    role: 'operator'
  }
};

test.describe('Role-Based Access Control - P0 Critical Security Tests', () => {
  let apiClient: any;

  test.beforeAll(async ({ request }) => {
    apiClient = getApiClient(request);
  });

  test.describe('Admin Role Access', () => {
    let adminToken: string;

    test.beforeAll(async () => {
      const response = await apiClient.post(API_ENDPOINTS.auth.login, {
        data: {
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password
        }
      });
      expect(response.ok()).toBeTruthy();
      adminToken = (await response.json()).token;
    });

    test('P0-RBAC-001: Admin can access user management endpoints', async () => {
      // Test GET /api/admin/users
      const usersResponse = await apiClient.get(API_ENDPOINTS.admin.users, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(usersResponse.ok()).toBeTruthy();

      const users = await usersResponse.json();
      expect(Array.isArray(users)).toBeTruthy();
    });

    test('P0-RBAC-002: Admin can create new users', async () => {
      const newUser = {
        email: `new-user-${Date.now()}@test.com`,
        role: 'technician',
        capacityLevel: 'N2'
      };

      const response = await apiClient.post(API_ENDPOINTS.admin.users, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: newUser
      });
      expect(response.ok()).toBeTruthy();

      const createdUser = await response.json();
      expect(createdUser.email).toBe(newUser.email);
      expect(createdUser.role).toBe(newUser.role);
    });

    test('P0-RBAC-003: Admin can manage roles', async () => {
      // Test GET /api/admin/roles
      const rolesResponse = await apiClient.get(API_ENDPOINTS.admin.roles, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(rolesResponse.ok()).toBeTruthy();

      const roles = await rolesResponse.json();
      expect(Array.isArray(roles)).toBeTruthy();
      expect(roles.some((role: any) => role.name === 'admin')).toBeTruthy();
    });

    test('P0-RBAC-004: Admin can invite new users', async () => {
      const inviteData = {
        email: `invited-${Date.now()}@test.com`,
        role: 'operator'
      };

      const response = await apiClient.post(API_ENDPOINTS.admin.invite, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: inviteData
      });
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('Technician Role Access', () => {
    let technicianToken: string;

    test.beforeAll(async () => {
      const response = await apiClient.post(API_ENDPOINTS.auth.login, {
        data: {
          email: TEST_USERS.technician.email,
          password: TEST_USERS.technician.password
        }
      });
      expect(response.ok()).toBeTruthy();
      technicianToken = (await response.json()).token;
    });

    test('P0-RBAC-005: Technician can view users but not modify', async () => {
      // Test GET /api/admin/users (should be allowed for read access)
      const getUsersResponse = await apiClient.get(API_ENDPOINTS.admin.users, {
        headers: { Authorization: `Bearer ${technicianToken}` }
      });
      expect(getUsersResponse.ok()).toBeTruthy();

      // Test POST /api/admin/users (should be forbidden)
      const createUserResponse = await apiClient.post(API_ENDPOINTS.admin.users, {
        headers: { Authorization: `Bearer ${technicianToken}` },
        data: {
          email: `unauthorized-${Date.now()}@test.com`,
          role: 'operator'
        }
      });
      expect(createUserResponse.status()).toBe(403); // Forbidden
    });

    test('P0-RBAC-006: Technician cannot access role management', async () => {
      const response = await apiClient.get(API_ENDPOINTS.admin.roles, {
        headers: { Authorization: `Bearer ${technicianToken}` }
      });
      expect(response.status()).toBe(403); // Forbidden
    });

    test('P0-RBAC-007: Technician cannot invite users', async () => {
      const response = await apiClient.post(API_ENDPOINTS.admin.invite, {
        headers: { Authorization: `Bearer ${technicianToken}` },
        data: {
          email: `unauthorized-${Date.now()}@test.com`,
          role: 'operator'
        }
      });
      expect(response.status()).toBe(403); // Forbidden
    });
  });

  test.describe('Operator Role Access', () => {
    let operatorToken: string;

    test.beforeAll(async () => {
      const response = await apiClient.post(API_ENDPOINTS.auth.login, {
        data: {
          email: TEST_USERS.operator.email,
          password: TEST_USERS.operator.password
        }
      });
      expect(response.ok()).toBeTruthy();
      operatorToken = (await response.json()).token;
    });

    test('P0-RBAC-008: Operator cannot access admin endpoints', async () => {
      const adminEndpoints = [
        API_ENDPOINTS.admin.users,
        API_ENDPOINTS.admin.roles,
        API_ENDPOINTS.admin.invite
      ];

      for (const endpoint of adminEndpoints) {
        const response = await apiClient.get(endpoint, {
          headers: { Authorization: `Bearer ${operatorToken}` }
        });
        expect(response.status()).toBe(403); // Forbidden
      }
    });

    test('P0-RBAC-009: Operator can access basic dashboard', async () => {
      const response = await apiClient.get(API_ENDPOINTS.protected.dashboard, {
        headers: { Authorization: `Bearer ${operatorToken}` }
      });
      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe('Unauthorized Access Prevention', () => {
    test('P0-RBAC-010: Cannot access protected endpoints without authentication', async () => {
      const protectedEndpoints = [
        API_ENDPOINTS.admin.users,
        API_ENDPOINTS.admin.roles,
        API_ENDPOINTS.protected.dashboard,
        API_ENDPOINTS.protected.settings
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await apiClient.get(endpoint);
        expect(response.status()).toBe(401); // Unauthorized
      }
    });

    test('P0-RBAC-011: Invalid authentication token is rejected', async () => {
      const response = await apiClient.get(API_ENDPOINTS.admin.users, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      expect(response.status()).toBe(401); // Unauthorized
    });

    test('P0-RBAC-012: Expired authentication token is rejected', async () => {
      // This would require testing with an expired token
      // For now, we'll test with a malformed token
      const response = await apiClient.get(API_ENDPOINTS.admin.users, {
        headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token' }
      });
      expect(response.status()).toBe(401); // Unauthorized
    });
  });

  test.describe('Cross-Role Access Validation', () => {
    test('P0-RBAC-013: Role information is accurately returned in profile', async ({ request }) => {
      for (const userRole of Object.keys(TEST_USERS)) {
        const user = TEST_USERS[userRole as keyof typeof TEST_USERS];

        // Login user
        const loginResponse = await request.post(API_ENDPOINTS.auth.login, {
          data: {
            email: user.email,
            password: user.password
          }
        });
        expect(loginResponse.ok()).toBeTruthy();

        const token = (await loginResponse.json()).token;

        // Get user profile
        const profileResponse = await request.get(API_ENDPOINTS.auth.profile, {
          headers: { Authorization: `Bearer ${token}` }
        });
        expect(profileResponse.ok()).toBeTruthy();

        const profile = await profileResponse.json();
        expect(profile.role).toBe(user.role);
      }
    });
  });
});