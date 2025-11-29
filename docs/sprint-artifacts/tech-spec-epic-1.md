# Epic Technical Specification: Foundation & User Management

Date: 2025-11-29
Author: Bernardo
Epic ID: 1
Status: Draft

---

## Overview

El Épico 1 establece la base técnica fundamental del sistema GMAO MVP, implementando la infraestructura inicial de Next.js con Supabase y la gestión completa de usuarios. Este épico aborda los Functional Requirements FR1-FR4 y FR38, creando el sistema de autenticación persistente, gestión de roles básicos y capacidades técnicas N1-N5. Es el prerequisito crítico para todos los demás epics, estableciendo los patrones de seguridad y acceso que se aplicarán en todo el sistema.

## Objectives and Scope

### In Scope:
- **Configuración inicial del proyecto** con Next.js 15, App Router, TypeScript y Supabase
- **Autenticación de usuarios** con email/contraseña usando Supabase Auth y sesiones persistentes
- **Gestión de roles básicos**: Operario, Técnico, Supervisor, Administrador con control de acceso
- **Capacidades técnicas N1-N5** para calificación de personal técnico
- **Sistema de invitación** por email para registro de nuevos usuarios
- **Middleware de Next.js** para protección de rutas básica
- **Row Level Security (RLS)** policies en PostgreSQL para acceso a datos

### Out of Scope:
- Gestión de permisos granular avanzada (requerimientos posteriores)
- Autenticación de terceros (OAuth, SAML)
- Login único (SSO)
- Políticas de contraseñas complejas
- Auditoría de accesos avanzada

## System Architecture Alignment

Este épico se alinea completamente con la arquitectura definida en el documento de Arquitectura Decision Document:

- **Stack Tecnológico**: Next.js 15 + Supabase + PostgreSQL 16
- **Patrón de Seguridad**: Row Level Security (RLS) en base de datos + Middleware de Next.js
- **Estado Global**: TanStack Query para estado del servidor + Zustand para estado UI local
- **Autenticación**: Supabase Auth con sesiones persistentes para tablets industriales
- **Estructura de Proyecto**: Directorios `/app/(auth)` y `/app/(dashboard)` según especificación
- **Componentes**: Shadcn/UI + Lucide React con enfoque "Industrial" (botones grandes, alto contraste)

## Detailed Design

### Services and Modules

#### Frontend Services (Next.js 15)

| Servicio | Responsabilidad | Componentes Clave | Inputs | Outputs |
|----------|----------------|-------------------|---------|---------|
| Auth Service | Gestión de autenticación | `useAuth`, `<LoginForm>`, `<ProtectedRoute>` | Email/Password, Tokens JWT | Session state, User profile |
| Profile Service | Gestión de perfiles de usuario | `useProfile`, `<ProfileForm>` | User ID, Role, Capacity Level | Profile data, Permissions |
| Admin Service | Administración de usuarios | `useUserManagement`, `<UserInvitation>` | Email, Role assignment | User creation, Invitation emails |
| UI Components | Componentes reutilizables | Shadcn/UI, Lucide Icons | Design tokens | Styled components |

#### Backend Services (Supabase)

| Servicio | Responsabilidad | Tablas | APIs |
|----------|----------------|---------|------|
| Auth Service | Autenticación y gestión de sesiones | `auth.users`, `public.profiles` | Supabase Auth API |
| Database Service | Gestión de datos con RLS | `profiles` | PostgreSQL queries |
| Storage Service | Almacenamiento de archivos | `storage.avatars` | Supabase Storage API |

### Data Models and Contracts

#### PostgreSQL Schema

```sql
-- Extended profile table linking to Supabase auth
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'operator',
  capacity_level public.capacity_level,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enums for type safety
CREATE TYPE public.user_role AS ENUM ('operator', 'technician', 'supervisor', 'admin');
CREATE TYPE public.capacity_level AS ENUM ('N1', 'N2', 'N3', 'N4', 'N5');

-- Indexes for performance
CREATE INDEX profiles_role_idx ON public.profiles(role);
CREATE INDEX profiles_capacity_idx ON public.profiles(capacity_level);
```

#### TypeScript Contracts

```typescript
// Database types (generated from Supabase)
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  capacity_level: CapacityLevel | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

type UserRole = 'operator' | 'technician' | 'supervisor' | 'admin';
type CapacityLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

// Auth state
interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

### APIs and Interfaces

#### Supabase Auth Endpoints

| Método | Endpoint | Descripción | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/auth/v1/signup` | Registro de usuario | `{ email, password }` | `{ user, session }` |
| POST | `/auth/v1/token?grant_type=password` | Login con email/contraseña | `{ email, password }` | `{ access_token, refresh_token, user }` |
| POST | `/auth/v1/logout` | Cierre de sesión | `{}` | Success |
| GET | `/auth/v1/user` | Obtener usuario actual | `{}` | `{ user }` |

#### Database API (RLS Protected)

| Tabla | Operaciones | RLS Policies | Permissions |
|-------|--------------|--------------|-------------|
| `profiles` | SELECT, UPDATE | Users can only see/edit own profile | Admins can see all profiles |

#### Internal Components API

```typescript
// Auth hook
const useAuth = () => {
  const signIn: (email: string, password: string) => Promise<void>;
  const signUp: (email: string, password: string) => Promise<void>;
  const signOut: () => Promise<void>;
  const resetPassword: (email: string) => Promise<void>;
};

// Profile management hook
const useProfile = (userId: string) => {
  const profile: Profile | null;
  const updateProfile: (updates: Partial<Profile>) => Promise<void>;
  const updateRole: (role: UserRole) => Promise<void>;
  const updateCapacity: (level: CapacityLevel) => Promise<void>;
};
```

### Workflows and Sequencing

#### Authentication Flow

```
1. User accesses /login
2. Enters email/password
3. Client validates form (Zod schema)
4. Calls supabase.auth.signInWithPassword()
5. Supabase validates credentials
6. Returns session + JWT tokens
7. Client stores tokens securely
8. Middleware validates JWT on protected routes
9. Redirect to /dashboard
10. Load user profile from profiles table
```

#### User Invitation Flow (Admin)

```
1. Admin accesses /admin/users/invite
2. Enters new user email
3. Selects initial role and capacity level
4. Calls supabase.auth.admin.inviteUserByEmail()
5. Supabase sends invitation email
6. User clicks email link
7. User sets password and completes registration
8. Profile created with assigned role/capacity
9. User can now login with credentials
```

#### Role-Based Access Flow

```
1. Middleware runs on protected route access
2. Extracts JWT from session
3. Validates token with Supabase
4. Queries user profile from database
5. Determines role and permissions
6. Allows/blocks route access
7. Role-specific UI components rendered
8. RLS policies enforce data access at DB level
```

## Non-Functional Requirements

### Performance

- **Authentication Response Time**: < 500ms for login/logout operations (NFR1)
- **Profile Loading**: < 200ms for user profile data retrieval
- **UI Responsiveness**: Mobile-first design optimized for tablets industrial use (NFR7)
- **Dashboard Load Time**: < 2 segundos como especificado en PRD NFR1
- **Real-time Updates**: Latencia percibida < 500ms para actualizaciones en tiempo real (NFR2)

### Security

- **Row Level Security (RLS)**: Todas las operaciones de datos están protegidas a nivel de base de datos (NFR3)
- **JWT Token Management**: Tokens seguros con expiración configurable y refresh automático
- **Input Validation**: Validación estricta con Zod schemas en cliente y servidor
- **Password Security**: Políticas de contraseñas enforcadas por Supabase Auth
- **Session Management**: Sesiones persistentes con timeout configurable para tablets industriales
- **Data Protection**: Datos sensibles (perfiles) solo accesibles según rol (NFR4)

### Reliability/Availability

- **Service Availability**: 99.9% uptime durante horarios operativos (NFR8)
- **Data Backup**: Backups automáticos diarios de PostgreSQL (NFR9)
- **Session Recovery**: Recuperación automática de sesión tras desconexión temporal
- **Error Handling**: Manejo robusto de errores con mensajes claros para usuarios industriales
- **Graceful Degradation**: Funcionalidad básica disponible incluso con conectividad limitada

### Observability

- **Authentication Events**: Logging de todos los eventos de auth (login, logout, failed attempts)
- **Performance Monitoring**: Métricas de tiempos de respuesta de endpoints críticos
- **Error Tracking**: Captura y reporte de errores con contexto completo
- **User Activity Logs**: Registro de acciones administrativas (cambios de rol, invitaciones)
- **Health Checks**: Endpoints de monitoreo para autenticación y base de datos

## Dependencies and Integrations

### External Dependencies

| Dependencia | Versión | Propósito | Integración |
|-------------|---------|-----------|-------------|
| Next.js | 15.x | Frontend framework | Core application framework |
| TypeScript | 5.x | Type safety | Strict mode enabled |
| Tailwind CSS | 3.4+ | Styling | Component styling system |
| Shadcn/UI | Latest | UI components | Component library (Radix UI) |
| Lucide React | Latest | Icons | Icon system |
| TanStack Query | v5 | Server state | Data fetching and caching |
| Zustand | Latest | Client state | Local UI state management |
| React Hook Form | Latest | Forms | Form handling with validation |
| Zod | Latest | Validation | Schema validation |
| Supabase | Latest | Backend | Auth, Database, Storage |
| next-pwa | Latest | PWA | Progressive Web App features |

### Integration Points

- **Supabase Auth**: Proveedor principal de autenticación y gestión de sesiones
- **Supabase PostgreSQL**: Base de datos principal con RLS policies
- **Supabase Storage**: Almacenamiento de avatares y archivos de perfil
- **Vercel Hosting**: Hosting para frontend Next.js
- **Email Service**: SMTP de Supabase para invitaciones y notificaciones

## Acceptance Criteria (Authoritative)

### Story 1.1: Project Setup & Initial Infrastructure
**Given** the project is new, **When** I run `npx create-next-app@latest . --example with-supabase`, **Then** a Next.js 15 project with App Router, TypeScript 5.x, and Supabase integration is initialized. **And** Tailwind CSS 3.4+, Shadcn/UI (Radix UI) and Lucide React are installed and configured. **And** TanStack Query v5 and Zustand are installed. **And** ESLint + Prettier are configured for consistent code style. **And** `next-pwa` is configured for PWA manifest.

### Story 1.2: User Authentication (Login/Logout)
**Given** I am on the login screen, **When** I enter valid email and password, **Then** I am authenticated via Supabase Auth and redirected to the dashboard. **And** a persistent session is established (FR4). **When** I click "Logout", **Then** my session is terminated, and I am redirected to the login screen. **And** error messages are displayed for invalid credentials.

### Story 1.3: User Registration & Invitation (Admin)
**Given** I am an administrator, **When** I enter a new user's email in the admin panel, **Then** an invitation email is sent via Supabase Auth (FR3). **And** the invited user receives an email with a link to set their password. **When** the invited user sets their password, **Then** their account is activated, and they can log in. **And** the system enforces first password change if required.

### Story 1.4: Role-Based Access Control (Basic)
**Given** a user is created, **When** an administrator assigns a `role` (Operator, Technician, Supervisor, Admin) to the user in the `public.profiles` table, **Then** the application's Next.js Middleware and RLS policies restrict dashboard navigation and data access based on this role (FR1). **And** the `public.profiles` table is correctly linked to `auth.users`.

### Story 1.5: Technical Capacity Levels (N1-N5)
**Given** I am editing a user profile (Technician or Supervisor), **When** I assign a capacity level (N1, N2, N3, N4, N5), **Then** this level is stored in their profile (FR2). **And** this level is visible when assigning work orders. **And** N5 is reserved for external providers or expert internal staff (linked to FR10).

## Traceability Mapping

| Acceptance Criteria | Functional Requirement | Spec Section | Component/API | Test Idea |
|--------------------|------------------------|--------------|---------------|-----------|
| Story 1.1 Setup | Foundation | Data Models | Project structure | Verify Next.js 15 + Supabase integration |
| Story 1.2 Auth | FR4, NFR7 | APIs & Interfaces | Supabase Auth API | Login/logout flow test |
| Story 1.3 Registration | FR3 | Services/Modules | Admin Service | Invitation email flow test |
| Story 1.4 RBAC | FR1, NFR3 | Security | RLS Policies, Middleware | Role-based access test |
| Story 1.5 Capacity | FR2 | Data Models | Profiles table | Capacity level assignment test |

## Risks, Assumptions, Open Questions

### Risks
- **Risk**: Supabase configuration complexity could delay initial setup
  **Mitigation**: Use official Vercel starter template and documented setup process
- **Risk**: RLS policies might be too restrictive for initial user flows
  **Mitigation**: Start with permissive policies, gradually tighten security
- **Risk**: Email service deliverability for user invitations
  **Mitigation**: Configure proper SPF/DNS records, test with different providers

### Assumptions
- **Assumption**: Good internet connectivity in plant (justified by PRD "Online First" approach)
- **Assumption**: Users have basic computer literacy for web interfaces
- **Assumption**: Tablets industrial devices support modern browsers and PWA installation

### Open Questions
- **Question**: Should we implement MFA (Multi-Factor Authentication) for admin users?
  **Next Step**: Evaluate security requirements vs user experience impact
- **Question**: How to handle password reset flow for industrial users?
  **Next Step**: Design simple, accessible reset flow with admin override capability
- **Question**: Session timeout duration for tablets in plant environment?
  **Next Step**: Define based on operational requirements and security policies

## Test Strategy Summary

### Test Levels
- **Unit Tests**: React Hook Form validation schemas, auth utility functions
- **Integration Tests**: Supabase auth flows, RLS policy enforcement, middleware protection
- **E2E Tests**: Complete user journeys (register → login → access dashboard → logout)

### Test Frameworks
- **Frontend**: Jest + React Testing Library for component and hook testing
- **E2E**: Playwright for browser automation scenarios
- **API**: Supabase local development with test database for RLS testing

### Coverage Requirements
- **Authentication Flows**: 100% coverage of login/logout/registration paths
- **Authorization**: Test all role-based access scenarios
- **Error Handling**: Test network failures, invalid credentials, permission denied
- **Mobile/Industrial**: Test on tablet devices with touch interfaces

### Test Environment Setup
- **Local**: Supabase CLI for local database and auth testing
- **Staging**: Mirror production Supabase project configuration
- **CI/CD**: Automated testing pipeline with database seeding for consistent test data

### Critical Test Scenarios
1. **Happy Path**: Admin invites user → User registers → Login → Dashboard access
2. **Security**: Unauthorized access attempts → RLS enforcement → Route protection
3. **Session Management**: Token expiration → Refresh flow → Logout cleanup
4. **Error Handling**: Invalid credentials → Network failures → Form validation
