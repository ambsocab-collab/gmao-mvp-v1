// Application constants for GMAO MVP v1
export const USER_ROLES = {
  OPERATOR: 'operator',
  TECHNICIAN: 'technician',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
} as const;

export const CAPACITY_LEVELS = {
  N1: 'N1',
  N2: 'N2',
  N3: 'N3',
  N4: 'N4',
  N5: 'N5',
} as const;

export const WORK_ORDER_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  BLOCKED: 'blocked',
  PENDING_VALIDATION: 'pending_validation',
  CLOSED: 'closed',
} as const;

export const ASSET_STATUSES = {
  OPERATIONAL: 'operational',
  MAINTENANCE_REQUIRED: 'maintenance_required',
  OUT_OF_SERVICE: 'out_of_service',
  DECOMMISSIONED: 'decommissioned',
} as const;