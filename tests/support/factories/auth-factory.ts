/**
 * Authentication Factory for Story 1.2 ATDD Tests
 *
 * Provides factory functions for creating test users with various scenarios:
 * - Valid users for login tests
 * - Invalid credentials for error handling tests
 * - Industrial-specific user scenarios
 */

import { faker } from '@faker-js/faker';

export type AuthUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'technician' | 'operator' | 'viewer';
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  userMetadata?: Record<string, any>;
};

export type InvalidCredentials = {
  email: string;
  password: string;
  description: string;
  expectedError?: string;
};

export class AuthFactory {
  private createdUsers: string[] = [];

  /**
   * Create a valid user with industrial-appropriate defaults
   */
  createUser(overrides: Partial<AuthUser> = {}): AuthUser {
    const user: AuthUser = {
      id: faker.string.uuid(),
      email: faker.internet.email({
        firstName: faker.person.firstName().toLowerCase(),
        lastName: faker.person.lastName().toLowerCase(),
        provider: 'gmao-industrial.test'
      }),
      password: faker.internet.password({
        length: 12,
        memorable: true,
        prefix: 'GMAO' // Industrial prefix
      }),
      name: faker.person.fullName(),
      role: 'operator', // Default role for industrial environment
      emailVerified: true,
      isActive: true,
      createdAt: faker.date.recent(),
      userMetadata: {
        theme: 'high-contrast',
        language: 'es',
        department: 'maintenance',
        shift: 'morning'
      },
      ...overrides,
    };

    this.createdUsers.push(user.id);
    return user;
  }

  /**
   * Create admin user for setup tasks
   */
  createAdminUser(overrides: Partial<AuthUser> = {}): AuthUser {
    return this.createUser({
      role: 'admin',
      email: faker.internet.email({
        firstName: 'admin',
        lastName: 'system',
        provider: 'gmao-industrial.test'
      }),
      userMetadata: {
        ...overrides.userMetadata,
        permissions: ['all'],
        department: 'IT'
      },
      ...overrides,
    });
  }

  /**
   * Create technician user for maintenance scenarios
   */
  createTechnicianUser(overrides: Partial<AuthUser> = {}): AuthUser {
    return this.createUser({
      role: 'technician',
      userMetadata: {
        ...overrides.userMetadata,
        certifications: ['electrical', 'mechanical'],
        department: 'maintenance'
      },
      ...overrides,
    });
  }

  /**
   * Create operator user for day-to-day operations
   */
  createOperatorUser(overrides: Partial<AuthUser> = {}): AuthUser {
    return this.createUser({
      role: 'operator',
      userMetadata: {
        ...overrides.userMetadata,
        station: 'production-line-a',
        shift: 'morning'
      },
      ...overrides,
    });
  }

  /**
   * Generate invalid credentials for error handling tests
   */
  createInvalidCredentials(): InvalidCredentials[] {
    const validEmail = faker.internet.email();

    return [
      {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
        description: 'Non-existent email address',
        expectedError: 'Invalid login credentials'
      },
      {
        email: validEmail,
        password: 'wrongpassword123',
        description: 'Correct email, wrong password',
        expectedError: 'Invalid login credentials'
      },
      {
        email: 'invalid-email-format',
        password: 'password123',
        description: 'Invalid email format',
        expectedError: 'Invalid email format'
      },
      {
        email: '',
        password: 'password123',
        description: 'Empty email field',
        expectedError: 'Email is required'
      },
      {
        email: validEmail,
        password: '',
        description: 'Empty password field',
        expectedError: 'Password is required'
      },
      {
        email: 'user@',
        password: 'password123',
        description: 'Malformed email',
        expectedError: 'Invalid email format'
      },
      {
        email: validEmail,
        password: '123', // Too short
        description: 'Password too short',
        expectedError: 'Password must be at least 8 characters'
      }
    ];
  }

  /**
   * Create user with specific session persistence scenario
   */
  createUserWithSession(overrides: Partial<AuthUser> = {}): AuthUser {
    return this.createUser({
      emailVerified: true,
      isActive: true,
      lastLogin: faker.date.recent(),
      userMetadata: {
        ...overrides.userMetadata,
        sessionTimeout: 3600, // 1 hour for industrial tablets
        autoLogin: true,
        rememberDevice: true
      },
      ...overrides,
    });
  }

  /**
   * Create user for industrial tablet testing
   */
  createTabletUser(overrides: Partial<AuthUser> = {}): AuthUser {
    return this.createUser({
      userMetadata: {
        theme: 'high-contrast',
        language: 'es',
        fontSize: 'large',
        touchOptimized: true,
        deviceType: 'tablet',
        department: 'maintenance',
        ...overrides.userMetadata
      },
      ...overrides,
    });
  }

  /**
   * Generate test user with specific role for testing role-based access
   */
  createUserByRole(role: AuthUser['role'], overrides: Partial<AuthUser> = {}): AuthUser {
    return this.createUser({ role, ...overrides });
  }

  /**
   * Create multiple users for bulk testing scenarios
   */
  createUsers(count: number, overrides: Partial<AuthUser> = {}): AuthUser[] {
    return Array.from({ length: count }, (_, index) =>
      this.createUser({
        ...overrides,
        email: overrides.email
          ? `${overrides.email}+${index}@example.com`
          : undefined // Let faker generate unique emails
      })
    );
  }

  /**
   * Generate test data for form validation scenarios
   */
  createFormData() {
    return {
      validEmails: [
        'user@example.com',
        'test.user@company.com',
        'operator@gmao-industrial.com'
      ],
      invalidEmails: [
        'invalid-email',
        'user@',
        '@domain.com',
        'user..user@domain.com',
        'user@domain',
        '',
        ' ',
        'user@domain.',
        '.user@domain.com'
      ],
      validPasswords: [
        'SecurePass123!',
        'GMAO2024@Secure',
        'IndustrialTech#1'
      ],
      invalidPasswords: [
        '', // Empty
        '123', // Too short
        'password', // No uppercase or numbers
        'PASSWORD', // No lowercase or numbers
        '12345678', // No letters
        'short', // Too short
        ' ' // Only space
      ]
    };
  }

  /**
   * Cleanup method for test isolation
   */
  async cleanup(): Promise<void> {
    console.log(`AuthFactory: Cleaning up ${this.createdUsers.length} created users`);

    // In a real implementation, this would:
    // 1. Delete users from Supabase Auth
    // 2. Clean up any database records
    // 3. Remove any test files or sessions

    this.createdUsers = [];

    // Simulate cleanup delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Get factory statistics for reporting
   */
  getStats(): { usersCreated: number; usersPendingCleanup: number } {
    return {
      usersCreated: this.createdUsers.length,
      usersPendingCleanup: this.createdUsers.length
    };
  }
}

// Export singleton instance for convenience
export const authFactory = new AuthFactory();