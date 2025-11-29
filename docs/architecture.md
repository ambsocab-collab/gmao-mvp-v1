# Architecture Decision Document - GMAO MVP v1

**Status:** Approved
**Date:** 2025-11-29
**Author:** Winston (AI Architect)
**Context:** Industrial Maintenance System (Brownfield/Greenfield Hybrid)

---

## 1. Executive Summary

The GMAO MVP v1 architecture is designed for **reliability, simplicity, and industrial usability**. It leverages a "Boring Technology" stack (Next.js, Supabase) to ensure stability while enabling modern features like Real-time Collaboration (Canvas) and PWA capabilities. The system prioritizes an **Online-First** approach with strong data consistency enforced directly at the database layer via Row Level Security (RLS).

## 2. Core Technology Stack & Versions

### Frontend Framework
*   **Framework:** **Next.js 15** (App Router)
*   **Language:** **TypeScript 5.x** (Strict mode enabled)
*   **Styling:** **Tailwind CSS 3.4+**
*   **Component Library:** **Shadcn/UI** (Radix UI primitives) + **Lucide React** (Icons)
*   **State Management:**
    *   Server State: **TanStack Query v5** (Caching, optimistic updates)
    *   Client UI State: **Zustand** (Canvas drag & drop state, global UI toggles)
*   **Forms:** **React Hook Form** + **Zod** (Validation schema)

### Backend & Database (BaaS)
*   **Platform:** **Supabase**
*   **Database:** **PostgreSQL 16**
*   **Auth:** Supabase Auth (Email/Password + Magic Link)
*   **Real-time:** Supabase Realtime (Postgres Changes) for Canvas updates
*   **Storage:** Supabase Storage (Images for issue reporting)

### Infrastructure & DevOps
*   **Hosting:** Vercel (Frontend) + Supabase Cloud (Backend)
*   **PWA:** `next-pwa` (Manifest generation, Service Worker for static asset caching)
*   **Linting:** ESLint + Prettier (Standard configurations)

## 3. Project Initialization Strategy

We will utilize the official Vercel Supabase starter to establish a solid, best-practice foundation.

**Initialization Command (First Implementation Story):**
```bash
npx create-next-app@latest . --example with-supabase
# Post-init: Install dependencies for Shadcn, Query, Zustand, etc.
```

## 4. Architectural Decisions & Patterns

### 4.1 Data Modeling Strategy
*   **Assets Hierarchy:** **Adjacency List Pattern**.
    *   Table `assets` includes a `parent_id` FK referencing `assets.id`.
    *   Use PostgreSQL `RECURSIVE CTE` queries for retrieving full asset trees.
*   **Inventory:** Transactional consistency.
    *   Stock levels are calculated or strictly managed via transactional updates.
    *   **Constraint:** Prevent negative stock via DB `CHECK (quantity >= 0)`.

### 4.2 Security & Permissions (RBAC)
*   **Pattern:** **Database-Level Security (RLS)**.
*   **Implementation:**
    *   `auth.users` (Supabase managed) handles identity.
    *   `public.profiles` table links to `auth.users` via `id`.
    *   `public.profiles` contains `role` (enum: 'operator', 'technician', 'supervisor', 'admin') and `capabilities` (jsonb/array).
*   **Enforcement:** ALL data access is governed by RLS policies.
    *   *Example:* `create policy "Operators can only see active assets" on assets for select using ( ... );`
*   **Middleware:** Next.js Middleware checks generic Auth state, but granular permission logic resides in RLS and specialized React components (e.g., `<ProtectRole role="admin">`).

### 4.3 State Management Patterns
*   **Server State (The Truth):** All business data (Assets, Orders, Stock) is managed via TanStack Query hooks (`useAssets`, `useWorkOrders`).
    *   *Stale Time:* 30s for general data, 0s for high-volatility data (Canvas).
*   **Local/UI State:** Zustand stores ephemeral state.
    *   *Canvas:* `useCanvasStore` tracks current drag operation, filtered columns, and view mode.

### 4.4 Real-Time Updates (The Canvas)
*   **Mechanism:** Supabase Realtime subscriptions on the `work_orders` table.
*   **Pattern:**
    1.  Initial load via TanStack Query.
    2.  Subscribe to `INSERT/UPDATE/DELETE` on `work_orders`.
    3.  On event, invalidate Query cache OR optimistically update Query cache (for smoother UX).

### 4.5 Offline Capability
*   **Scope:** **Online-First**.
*   **Behavior:**
    *   App installs as PWA (TWA ready).
    *   App Shell (UI) loads offline via Service Worker.
    *   Data requests fail gracefully with a "No Connection" toast/banner if offline.
    *   *No complex offline sync queue* for MVP to reduce risk.

## 5. Project Structure (Source Tree)

```
gmao-mvp-v1/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication routes (login, forgot-password)
│   │   └── login/
│   ├── (dashboard)/            # Protected app routes
│   │   ├── layout.tsx          # Main Dashboard Layout (Sidebar/Nav)
│   │   ├── page.tsx            # Dashboard Home
│   │   ├── assets/             # Asset Management
│   │   ├── orders/             # Work Orders (List & Details)
│   │   ├── canvas/             # Visual Planning Canvas
│   │   └── inventory/          # Spare Parts & Stock
│   ├── api/                    # Next.js API Routes (if needed for edge cases)
│   ├── global.css              # Tailwind imports
│   └── layout.tsx              # Root Layout (Providers: QueryClient, Theme)
├── components/
│   ├── ui/                     # Shadcn/UI primitives (Button, Card, Dialog)
│   ├── assets/                 # Asset-specific components
│   ├── orders/                 # Order-specific components (OrderCard)
│   ├── canvas/                 # Canvas-specific components (Board, Column)
│   └── shared/                 # Reusable app components (UserAvatar, StatusBadge)
├── lib/
│   ├── supabase/               # Supabase client configuration (Client/Server)
│   ├── utils.ts                # Helper functions (cn, formatters)
│   ├── constants.ts            # Static constants (Roles, Statuses)
│   └── hooks/                  # Custom React Hooks (use-profile, use-toast)
├── types/                      # TypeScript Definitions
│   ├── database.types.ts       # Generated Supabase types
│   └── index.ts                # App-specific interfaces
├── public/                     # Static assets (images, icons, manifest.json)
└── ...config files             # next.config.js, tailwind.config.ts, etc.
```

## 6. Implementation Conventions

### 6.1 Naming Patterns
*   **Files:** `kebab-case.tsx` or `kebab-case.ts` (e.g., `user-profile.tsx`, `order-utils.ts`).
*   **Components:** `PascalCase` (e.g., `UserProfile`, `OrderCard`).
*   **Hooks:** `camelCase` starting with `use` (e.g., `useWorkOrders`).
*   **Database Tables:** `snake_case` (e.g., `work_orders`, `asset_types`).
*   **Database Columns:** `snake_case` (e.g., `created_at`, `assigned_user_id`).

### 6.2 Coding Standards
*   **Exports:** Use Named Exports (`export const Button = ...`) over Default Exports to facilitate refactoring.
*   **Types:** ALWAYS generate types from Supabase schema (`supabase gen types`). Extend these types in `types/index.ts` only when adding UI-specific properties.
*   **Strict Mode:** No `any` types allowed.

### 6.3 Error Handling
*   **UI:** Use `sonner` or `use-toast` for user feedback (Success/Error toasts).
*   **Boundaries:** Wrap major route segments in `error.tsx` Error Boundaries.
*   **Logging:** `console.error` for MVP dev environment.

## 7. Integration Points

*   **Supabase:** The single source of truth for Data, Auth, and Storage.
*   **Email Service:** Supabase Auth built-in SMTP (configurable) for invitations/alerts.

---
