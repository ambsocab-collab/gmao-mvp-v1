# Story 1.3: User Registration & Invitation (Admin)

Status: ready-for-dev

## Story

As an **administrator**,
I want **to invite new users via email and manage their initial registration**,
so that **I can onboard new team members securely**.

## Acceptance Criteria

1. [AC: Admin User Invitation] Given I am an administrator, When I enter a new user's email in the admin panel, Then an invitation email is sent via Supabase Auth (FR3). And the invited user receives an email with a link to set their password.

2. [AC: User Registration Flow] When the invited user sets their password, Then their account is activated, and they can log in. And the system enforces first password change if required.

3. [AC: Admin Interface] Given I have admin privileges, When I access the user invitation panel, Then I can see a form to invite new users with email and role assignment. And the interface follows industrial UI patterns with large touch targets.

4. [AC: Invitation Status Tracking] Given I have sent invitations, When I view the invitation management panel, Then I can see the status of pending invitations (sent, accepted, expired). And I can resend invitations for expired links.

5. [AC: Role Assignment] Given I am inviting a new user, When I select their initial role (Operator, Technician, Supervisor, Admin), Then this role is assigned to their profile upon successful registration. And the role assignment follows the RBAC patterns established in Story 1.2.

## Tasks / Subtasks

- [ ] Implement admin invitation interface (AC: 3, 5)
  - [ ] Create `/app/(dashboard)/admin/users/invite` route
  - [ ] Build invitation form with email input and role selector
  - [ ] Use industrial design patterns from Story 1.2
  - [ ] Add form validation with React Hook Form + Zod

- [ ] Integrate Supabase Auth invitation API (AC: 1, 2)
  - [ ] Implement `useUserInvitation` hook with TanStack Query
  - [ ] Connect to Supabase `admin.inviteUserByEmail()` method
  - [ ] Handle invitation email sending and error states
  - [ ] Test email delivery and link functionality

- [ ] Create invitation status tracking system (AC: 4)
  - [ ] Extend database schema to track invitation status
  - [ ] Build invitation management panel interface
  - [ ] Implement invitation resend functionality
  - [ ] Add status filtering and search capabilities

- [ ] Implement user registration flow completion (AC: 2)
  - [ ] Create `/auth/invite` route for email link handling
  - [ ] Build password setup form with validation
  - [ ] Connect to Supabase Auth `updateUser()` method
  - [ ] Handle first-time login and password change enforcement

- [ ] Add security and validation measures (AC: 1, 2, 5)
  - [ ] Implement email format validation and domain restrictions
  - [ ] Add rate limiting for invitation requests
  - [ ] Secure role assignment with admin-only permissions
  - [ ] Create audit logging for invitation activities

## Dev Notes

### Architecture Alignment
- Follow the established Supabase Auth patterns from Story 1.2 [Source: test-design-epic-1.md#Mitigation-Plans]
- Use TanStack Query for server state management like authentication system
- Implement Row Level Security (RLS) policies for admin-only access
- Maintain industrial UI consistency with large buttons and high contrast

### Project Structure Requirements
- Extend `/app/(dashboard)/admin/` directory structure from authentication setup
- Use existing Shadcn/UI components from Story 1.1 foundation
- Follow naming conventions: kebab-case files, PascalCase components
- Leverage existing `lib/supabase/` configuration for auth operations

### Database Schema Extensions
```sql
-- Extend profiles table with invitation tracking
ALTER TABLE public.profiles
ADD COLUMN invitation_status invitation_status DEFAULT 'pending',
ADD COLUMN invited_by UUID REFERENCES public.profiles(id),
ADD COLUMN invited_at TIMESTAMP WITH TIME ZONE;

CREATE TYPE public.invitation_status AS ENUM (
    'pending',
    'accepted',
    'expired',
    'revoked'
);
```

### Security Requirements
- Admin-only access to invitation functionality via RLS policies
- Email validation to prevent spam invitations
- Role assignment restricted to admin users only
- Audit trail for all invitation activities [Source: architecture.md#Security--Permissions-RBAC]

### UI/UX Considerations
- Industrial design with large buttons (>44px) for admin tablet usage [Source: PRD NFR7]
- High contrast design for visibility in administrative environments
- Clear status indicators for invitation tracking
- Mobile-responsive layout for admin on tablets
- Spanish error messages for administrative staff

### Integration Points
- Supabase Auth for email sending and user management
- Existing authentication system from Story 1.2 for seamless integration
- Role-based access control system from Story 1.4 (when available)
- Admin dashboard structure established in previous stories

### Project Structure Notes
- **Alignment with unified project structure**: Building on authentication foundation from Story 1.2
- **Reusing existing components**: LoginForm patterns can be adapted for InvitationForm
- **Consistent patterns**: Same TanStack Query patterns, validation schemas, and industrial UI
- **No conflicts detected**: Story extends admin functionality without conflicting with existing auth

### References
- [Source: docs/epics.md#Story-13-User-Registration--Invitation-Admin]
- [Source: docs/test-design-epic-1.md#Test-Coverage-Plan]
- [Source: docs/architecture.md#Security--Permissions-RBAC]
- [Source: docs/prd.md#FR3]
- [Source: docs/sprint-artifacts/1-2-user-authentication-login-logout.md] - Authentication patterns and industrial UI

## Learnings from Previous Story

**From Story 1.2 (Status: done)**

- **Authentication Foundation**: Supabase Auth fully configured with TanStack Query integration
- **Industrial UI Patterns**: Large buttons (56px), high contrast design, and tablet-optimized layouts established
- **Form Validation Patterns**: React Hook Form + Zod schemas working effectively
- **Security Framework**: Session management, route protection, and input validation patterns ready
- **Component Library**: Shadcn/UI components tested and available for immediate use
- **Testing Infrastructure**: E2E testing patterns with data-testid attributes established

**Key Services to Reuse:**
- `lib/hooks/use-auth.ts` - Auth patterns can be adapted for invitation flows
- `providers/auth-provider.tsx` - For auth state management during registration
- `lib/supabase/` - Already configured Supabase client with admin capabilities
- `components/ui/` - Shadcn/UI components for form building (Button, Input, Card)
- `components/login-form.tsx` - Form patterns can be adapted for invitation forms
- `app/(auth)/login/page.tsx` - Industrial UI patterns for admin interfaces
- `lib/utils.ts` - Utility functions for form validation and error handling

**Technical Debt Deferred:** None from Story 1.2 (completed cleanly)

**Architecture Patterns Established:**
- TanStack Query for server state management with proper error handling
- Industrial UI design with proper touch targets and high contrast
- Form validation with React Hook Form + Zod schemas
- Named exports and TypeScript strict mode adherence
- E2E testing compatibility with data-testid attributes

**Security Patterns:**
- Admin-only route protection patterns from middleware.ts
- Input validation with Zod schemas ready to implement
- Session management and token refresh patterns available
- Environment variable security established for Supabase configuration

[Source: docs/sprint-artifacts/1-2-user-authentication-login-logout.md#Dev-Agent-Record]

## Change Log

- 2025-11-30: Initial story drafted (Bernardo + Claude Sonnet 4.5)

## Dev Agent Record

### Context Reference

- Context XML: `docs/sprint-artifacts/1-3-user-registration-invitation-admin.context.xml`

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List