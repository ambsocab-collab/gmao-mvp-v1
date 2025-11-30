/**
 * Invitation Factory - Test Data Generation
 *
 * Factory functions for creating invitation test data with faker
 * Following BMad Test Architecture patterns
 */

import { faker } from '@faker-js/faker';

// Types matching the application schema
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type UserRole = 'operator' | 'technician' | 'supervisor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  invitationStatus?: InvitationStatus;
  invitedBy?: string;
  invitedAt?: Date;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  createdAt: Date;
  invitedBy: string;
  acceptedAt?: Date;
  expiresAt?: Date;
  token?: string;
}

/**
 * Create a user with factory pattern and overrides
 * Uses faker for unique, parallel-safe data
 */
export const createUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: 'operator',
  isActive: true,
  createdAt: faker.date.recent(),
  ...overrides,
});

/**
 * Create an admin user
 */
export const createAdminUser = (overrides: Partial<User> = {}): User =>
  createUser({ role: 'admin', ...overrides });

/**
 * Create users with different roles
 */
export const createOperator = (overrides: Partial<User> = {}): User =>
  createUser({ role: 'operator', ...overrides });

export const createTechnician = (overrides: Partial<User> = {}): User =>
  createUser({ role: 'technician', ...overrides });

export const createSupervisor = (overrides: Partial<User> = {}): User =>
  createUser({ role: 'supervisor', ...overrides });

/**
 * Create an invitation with factory pattern
 */
export const createInvitation = (overrides: Partial<Invitation> = {}): Invitation => {
  const invitedBy = overrides.invitedBy || faker.internet.email();
  const createdAt = overrides.createdAt || faker.date.recent();

  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    role: 'operator',
    status: 'pending',
    createdAt,
    invitedBy,
    expiresAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    token: faker.string.uuid(),
    ...overrides,
  };
};

/**
 * Create invitations with different statuses
 */
export const createPendingInvitation = (overrides: Partial<Invitation> = {}): Invitation =>
  createInvitation({ status: 'pending', ...overrides });

export const createAcceptedInvitation = (overrides: Partial<Invitation> = {}): Invitation => {
  const createdAt = faker.date.recent({ days: 2 });
  const acceptedAt = faker.date.recent({ days: 1 });

  return createInvitation({
    status: 'accepted',
    createdAt,
    acceptedAt,
    ...overrides,
  });
};

export const createExpiredInvitation = (overrides: Partial<Invitation> = {}): Invitation => {
  const createdAt = faker.date.past({ years: 0.03 }); // ~10 days
  const expiresAt = faker.date.past({ years: 0.01 }); // ~3 days

  return createInvitation({
    status: 'expired',
    createdAt,
    expiresAt,
    ...overrides,
  });
};

export const createRevokedInvitation = (overrides: Partial<Invitation> = {}): Invitation =>
  createInvitation({ status: 'revoked', ...overrides });

/**
 * Create invitation with specific role
 */
export const createInvitationWithRole = (
  role: UserRole,
  overrides: Partial<Invitation> = {}
): Invitation => createInvitation({ role, ...overrides });

/**
 * Create multiple users
 */
export const createUsers = (count: number, overrides: Partial<User> = {}): User[] =>
  Array.from({ length: count }, () => createUser(overrides));

/**
 * Create multiple invitations
 */
export const createInvitations = (count: number, overrides: Partial<Invitation> = {}): Invitation[] =>
  Array.from({ length: count }, () => createInvitation(overrides));

/**
 * Create complete invitation workflow data (admin + pending invitations + accepted users)
 */
export const createInvitationWorkflowData = (options: {
  pendingCount?: number;
  acceptedCount?: number;
  expiredCount?: number;
} = {}): {
  adminUser: User;
  pendingInvitations: Invitation[];
  acceptedInvitations: Invitation[];
  expiredInvitations: Invitation[];
  allInvitations: Invitation[];
} => {
  const {
    pendingCount = 2,
    acceptedCount = 3,
    expiredCount = 1,
  } = options;

  const adminUser = createAdminUser({
    email: 'admin@gmao-industrial.com',
    name: 'Admin User',
  });

  const pendingInvitations = Array.from({ length: pendingCount }, (_, i) =>
    createPendingInvitation({
      email: `pending-user-${i + 1}@example.com`,
      role: ['operator', 'technician', 'supervisor'][i % 3] as UserRole,
      invitedBy: adminUser.email,
    })
  );

  const acceptedInvitations = Array.from({ length: acceptedCount }, (_, i) =>
    createAcceptedInvitation({
      email: `accepted-user-${i + 1}@example.com`,
      role: ['operator', 'technician', 'supervisor'][i % 3] as UserRole,
      invitedBy: adminUser.email,
    })
  );

  const expiredInvitations = Array.from({ length: expiredCount }, (_, i) =>
    createExpiredInvitation({
      email: `expired-user-${i + 1}@example.com`,
      role: ['operator', 'technician'][i % 2] as UserRole,
      invitedBy: adminUser.email,
    })
  );

  const allInvitations = [
    ...pendingInvitations,
    ...acceptedInvitations,
    ...expiredInvitations,
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    adminUser,
    pendingInvitations,
    acceptedInvitations,
    expiredInvitations,
    allInvitations,
  };
};

/**
 * Create test data for specific acceptance criteria
 */
export const createAC1TestData = () => ({
  adminUser: createAdminUser({
    email: 'admin-inviter@gmao.com',
    name: 'Test Admin',
  }),
  newUser: createUser({
    email: 'new-user@gmao.com',
    role: 'operator',
    invitationStatus: 'pending',
  }),
});

export const createAC2TestData = () => ({
  invitationToken: faker.string.uuid(),
  newUser: createUser({
    email: 'invited-user@gmao.com',
    role: 'technician',
    isActive: false,
  }),
});

export const createAC4TestData = () => {
  const adminUser = createAdminUser();
  const baseTime = faker.date.recent({ days: 5 });

  return {
    adminUser,
    invitations: [
      createPendingInvitation({
        email: 'pending1@gmao.com',
        role: 'operator',
        createdAt: baseTime,
        invitedBy: adminUser.email,
      }),
      createAcceptedInvitation({
        email: 'accepted1@gmao.com',
        role: 'technician',
        createdAt: new Date(baseTime.getTime() - 86400000), // 1 day ago
        invitedBy: adminUser.email,
      }),
      createExpiredInvitation({
        email: 'expired1@gmao.com',
        role: 'supervisor',
        createdAt: new Date(baseTime.getTime() - 7 * 86400000), // 7 days ago
        invitedBy: adminUser.email,
      }),
    ],
  };
};

/**
 * Factory for role-based test scenarios
 */
export const createRoleAssignmentTestData = () => ({
  adminUser: createAdminUser({
    email: 'admin@gmao.com',
  }),
  roleAssignments: [
    { email: 'operator@gmao.com', role: 'operator' as UserRole },
    { email: 'technician@gmao.com', role: 'technician' as UserRole },
    { email: 'supervisor@gmao.com', role: 'supervisor' as UserRole },
    { email: 'new-admin@gmao.com', role: 'admin' as UserRole },
  ],
});

export default {
  // User factories
  createUser,
  createAdminUser,
  createOperator,
  createTechnician,
  createSupervisor,
  createUsers,

  // Invitation factories
  createInvitation,
  createPendingInvitation,
  createAcceptedInvitation,
  createExpiredInvitation,
  createRevokedInvitation,
  createInvitationWithRole,
  createInvitations,

  // Workflow data
  createInvitationWorkflowData,
  createAC1TestData,
  createAC2TestData,
  createAC4TestData,
  createRoleAssignmentTestData,
};