# gmao-mvp-v1 - Epic Breakdown

**Author:** Bernardo
**Date:** sábado, 29 de noviembre de 2025
**Project Level:** MVP
**Target Scale:** Industrial Plant

---

## Overview

This document provides the complete epic and story breakdown for gmao-mvp-v1, decomposing the requirements from the [PRD](./prd.md) into implementable stories.

**Living Document Notice:** This is the initial version. It will be updated after UX Design and Architecture workflows add interaction and technical details to stories.

## Epics Proposed

Here is the proposed epic structure, based on natural groupings of functional requirements, prioritizing user value delivery.

### Epic 1: Foundation & User Management
**Goal:** Establish the core technical foundation and enable basic user authentication and management.

### Epic 2: Asset Management Core
**Goal:** Provide comprehensive management for all physical assets within the system.

### Epic 3: Core Maintenance Flow (OT & Reactive)
**Goal:** Implement the primary process for creating, tracking, and completing maintenance work orders.

### Epic 4: Visual Planning Canvas
**Goal:** Offer a real-time, visual interface for supervisors to plan, assign, and monitor work orders.

### Epic 5: Inventory & Spare Parts Management
**Goal:** Manage the catalog, stock levels, and consumption of spare parts.

### Epic 6: Advanced Flows & Rotables
**Goal:** Implement specialized maintenance processes, including rotable component management and external services.

### Epic 7: Compliance & Non-Conformities
**Goal:** Ensure regulatory adherence and systematic management of non-conformities.

### Epic 8: Procurement Integration
**Goal:** Streamline the process of identifying, requesting, and purchasing necessary parts and services.

### Epic 9: Analytics, Reporting & Display
**Goal:** Provide key performance indicators, data export, and factory-wide visual management.

---

## Functional Requirements Inventory

- **FR1:** User Access by Roles (Operator, Technician, Supervisor, Admin)
- **FR2:** Technical Capacity Levels (N1-N5)
- **FR3:** User Invitation & Registration
- **FR4:** Persistent Authentication (Supabase Auth)
- **FR5:** Multidimensional Asset Structure (Hierarchy, Families, Systems)
- **FR6:** Asset Technical Sheet & History
- **FR7:** Predictive Asset Search
- **FR8:** Reactive Flow (Line Notification creation)
- **FR9:** Direct Flow (Work Order creation)
- **FR10:** External Flow (N5/External Providers)
- **FR11:** Conversion NL -> OT
- **FR12:** Visual Canvas (Kanban Board)
- **FR13:** Canvas Drag & Drop Assignment
- **FR14:** Real-time Canvas States
- **FR15:** Canvas Filters
- **FR16:** Technician "My Orders" View
- **FR17:** Work Log (Diagnosis, Actions, Time, Parts)
- **FR18:** Closure Request & Validation Flow
- **FR19:** Blocking States Management
- **FR20:** Spare Parts Catalog
- **FR21:** Automatic Stock Deduction
- **FR22:** Low Stock Alerts
- **FR23:** Stock Receipt (Entry Management)
- **FR24:** Critical Notifications
- **FR25:** Actionable Notifications
- **FR26:** Compliance Calendar
- **FR27:** Non-Conformities (NC) Registry
- **FR28:** Flow NC -> OT
- **FR29:** NC Closure Blocking Logic
- **FR30:** Legal Document Repository per Asset
- **FR31:** Rotable Substitution
- **FR32:** Recovery Cycle (Repair Request)
- **FR33:** Procurement Needs Management
- **FR34:** Purchase Order Generation
- **FR35:** Stock Regularization (Adjustments)
- **FR36:** Bulk Data Import
- **FR37:** Data Export (CSV)
- **FR38:** Granular Permissions
- **FR39:** KPI Dashboard
- **FR40:** TV / Kiosk Mode
- **FR41:** Work Order Log/Chat

---

## FR Coverage Map

This map shows which Functional Requirements are covered by each proposed Epic.

- **Epic 1: Foundation & User Management:** FR1, FR3, FR4, FR38
- **Epic 2: Asset Management Core:** FR5, FR6, FR7, FR36
- **Epic 3: Core Maintenance Flow (OT & Reactive):** FR8, FR9, FR11, FR16, FR17, FR18, FR41
- **Epic 4: Visual Planning Canvas:** FR12, FR13, FR14, FR15, FR19
- **Epic 5: Inventory & Spare Parts Management:** FR20, FR21, FR22, FR23, FR35
- **Epic 6: Advanced Flows & Rotables:** FR31, FR32, FR10
- **Epic 7: Compliance & Non-Conformities:** FR26, FR27, FR28, FR29, FR30
- **Epic 8: Procurement Integration:** FR33, FR34
- **Epic 9: Analytics, Reporting & Display:** FR39, FR40, FR37

---

<!-- Repeat for each epic (N = 1, 2, 3...) -->

## Epic 2: Asset Management Core

**Goal:** Provide comprehensive management for all physical assets within the system.

### Story 2.1: Multidimensional Asset Structure & CRUD

As an **administrator**,
I want **to create, read, update, and delete assets with a flexible multidimensional structure (hierarchy, typology, systems)**,
So that **I can accurately model our plant equipment**.

**Acceptance Criteria:**

**Given** I am on the asset management screen,
**When** I create a new asset,
**Then** I can define its name, description, and link it to a parent asset (hierarchy - `parent_id` in `assets` table) (FR5).
**And** I can assign it a typology (family) and functional systems.

**When** I view an asset,
**Then** its hierarchical path (breadcrumbs) and associated typology/systems are displayed.
**And** CRUD operations are available for assets.

**Prerequisites:** Story 1.4 (Role-Based Access Control)

**Technical Notes:** Implement `assets` table with `parent_id` for adjacency list. Use recursive CTEs for hierarchy display. Implement basic forms for asset creation/editing. UX: Tree view for hierarchy, forms for details.

### Story 2.2: Asset Technical Sheet & Documentation

As a **technician**,
I want **to access a detailed technical sheet and associated documentation for any asset**,
So that **I have all necessary information for maintenance tasks**.

**Acceptance Criteria:**

**Given** I am viewing an asset's details,
**When** I navigate to its technical sheet,
**Then** I see predefined technical attributes (e.g., model, serial, manufacturer, installation date).
**And** I can view/download attached documents (manuals, certifications, schematics) (FR6).

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD)

**Technical Notes:** Extend `assets` table with `jsonb` for technical attributes. Implement Supabase Storage for document uploads, linked to `assets`.

### Story 2.3: Predictive Asset Search

As a **user**,
I want **to quickly find assets by typing their name, code, or tag**,
So that **I can access their information without extensive navigation**.

**Acceptance Criteria:**

**Given** I am in the asset management section,
**When** I type in the search bar,
**Then** a list of matching assets appears dynamically based on name, code, or QR tag (FR7).
**And** the search is fast and responsive.

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD)

**Technical Notes:** Implement a full-text search index on relevant asset fields (name, code, description). Utilize `TSQuery` in PostgreSQL for efficient search.

### Story 2.4: Bulk Asset Data Import (Admin)

As an **administrator**,
I want **to import and update asset data in bulk using standardized files (CSV/Excel)**,
So that **I can quickly populate and maintain the asset registry**.

**Acceptance Criteria:**

**Given** I am in the admin panel's data management section,
**When** I upload a valid CSV/Excel file with asset data,
**Then** the system processes the file and imports/updates assets (FR36).
**And** I receive feedback on the success or failure of the import, including any errors.
**And** the system provides a downloadable template for the import file structure.

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD), Story 1.4 (Role-Based Access Control - Admin access).

**Technical Notes:** Implement a backend function (Supabase Edge Function or custom API if necessary) for processing bulk uploads. Handle data validation and error reporting.

---


## Epic 1: Foundation & User Management

**Goal:** Establish the core technical foundation and enable basic user authentication and management.

### Story 1.1: Project Setup & Initial Infrastructure

As a **developer**,
I want **a working Next.js project with Supabase integration and basic UI components**,
So that **I can start building features immediately**.

**Acceptance Criteria:**

**Given** the project is new,
**When** I run `npx create-next-app@latest . --example with-supabase`,
**Then** a Next.js 15 project with App Router, TypeScript 5.x, and Supabase integration is initialized.

**And** Tailwind CSS 3.4+, Shadcn/UI (Radix UI) and Lucide React are installed and configured.
**And** TanStack Query v5 and Zustand are installed.
**And** ESLint + Prettier are configured for consistent code style.
**And** `next-pwa` is configured for PWA manifest.

**Prerequisites:** None

**Technical Notes:** Use Vercel Supabase starter. Ensure basic directory structure is set up as per architecture.

### Story 1.2: User Authentication (Login/Logout)

As a **user**,
I want **to securely log in and out of the application using email and password**,
So that **I can access my personalized features**.

**Acceptance Criteria:**

**Given** I am on the login screen,
**When** I enter valid email and password,
**Then** I am authenticated via Supabase Auth and redirected to the dashboard.
**And** a persistent session is established (FR4).

**When** I click "Logout",
**Then** my session is terminated, and I am redirected to the login screen.
**And** error messages are displayed for invalid credentials.

**Prerequisites:** Story 1.1 (Project Setup & Initial Infrastructure)

**Technical Notes:** Implement `/app/(auth)/login` route. Use Supabase Auth helper functions. Use React Hook Form with Zod for client-side validation. UX: Mobile-first layout with `GiantButton` and clear input fields.

### Story 1.3: User Registration & Invitation (Admin)

As an **administrator**,
I want **to invite new users via email and manage their initial registration**,
So that **I can onboard new team members securely**.

**Acceptance Criteria:**

**Given** I am an administrator,
**When** I enter a new user's email in the admin panel,
**Then** an invitation email is sent via Supabase Auth (FR3).
**And** the invited user receives an email with a link to set their password.

**When** the invited user sets their password,
**Then** their account is activated, and they can log in.
**And** the system enforces first password change if required.

**Prerequisites:** Story 1.2 (User Authentication)

**Technical Notes:** Implement an admin interface for user invitation. Supabase Auth handles email sending.

### Story 1.4: Role-Based Access Control (Basic)

As an **administrator**,
I want **to assign basic roles to users (Operator, Technician, Supervisor, Admin)**,
So that **access to features can be restricted according to their responsibilities**.

**Acceptance Criteria:**

**Given** a user is created,
**When** an administrator assigns a `role` (Operator, Technician, Supervisor, Admin) to the user in the `public.profiles` table,
**Then** the application's Next.js Middleware and RLS policies restrict dashboard navigation and data access based on this role (FR1).
**And** the `public.profiles` table is correctly linked to `auth.users`.

**Prerequisites:** Story 1.3 (User Registration & Invitation)

**Technical Notes:** Implement initial RLS policies for `public.profiles` and basic route protection in Next.js Middleware. Define `role` as an enum in `public.profiles`.

### Story 1.5: Technical Capacity Levels (N1-N5)

As an **administrator**,
I want **to assign a technical capacity level (N1-N5) to technicians**,
So that **I can ensure only qualified personnel perform specific tasks**.

**Acceptance Criteria:**

**Given** I am editing a user profile (Technician or Supervisor),
**When** I assign a capacity level (N1, N2, N3, N4, N5),
**Then** this level is stored in their profile (FR2).
**And** this level is visible when assigning work orders.
**And** N5 is reserved for external providers or expert internal staff (linked to FR10).

**Prerequisites:** Story 1.4 (Role-Based Access Control)

**Technical Notes:** Add `capacity_level` enum (N1..N5) to `public.profiles`. Update profile management UI to include this field.

---


## Epic 2: Asset Management Core

**Goal:** Provide comprehensive management for all physical assets within the system.

### Story 2.1: Multidimensional Asset Structure & CRUD

As an **administrator**,
I want **to create, read, update, and delete assets with a flexible multidimensional structure (hierarchy, typology, systems)**,
So that **I can accurately model our plant equipment**.

**Acceptance Criteria:**

**Given** I am on the asset management screen,
**When** I create a new asset,
**Then** I can define its name, description, and link it to a parent asset (hierarchy - `parent_id` in `assets` table) (FR5).
**And** I can assign it a typology (family) and functional systems.

**When** I view an asset,
**Then** its hierarchical path (breadcrumbs) and associated typology/systems are displayed.
**And** CRUD operations are available for assets.

**Prerequisites:** Story 1.4 (Role-Based Access Control)

**Technical Notes:** Implement `assets` table with `parent_id` for adjacency list. Use recursive CTEs for hierarchy display. Implement basic forms for asset creation/editing. UX: Tree view for hierarchy, forms for details.

### Story 2.2: Asset Technical Sheet & Documentation

As a **technician**,
I want **to access a detailed technical sheet and associated documentation for any asset**,
So that **I have all necessary information for maintenance tasks**.

**Acceptance Criteria:**

**Given** I am viewing an asset's details,
**When** I navigate to its technical sheet,
**Then** I see predefined technical attributes (e.g., model, serial, manufacturer, installation date).
**And** I can view/download attached documents (manuals, certifications, schematics) (FR6).

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD)

**Technical Notes:** Extend `assets` table with `jsonb` for technical attributes. Implement Supabase Storage for document uploads, linked to `assets`.

### Story 2.3: Predictive Asset Search

As a **user**,
I want **to quickly find assets by typing their name, code, or tag**,
So that **I can access their information without extensive navigation**.

**Acceptance Criteria:**

**Given** I am in the asset management section,
**When** I type in the search bar,
**Then** a list of matching assets appears dynamically based on name, code, or QR tag (FR7).
**And** the search is fast and responsive.

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD)

**Technical Notes:** Implement a full-text search index on relevant asset fields (name, code, description). Utilize `TSQuery` in PostgreSQL for efficient search.

### Story 2.4: Bulk Asset Data Import (Admin)

As an **administrator**,
I want **to import and update asset data in bulk using standardized files (CSV/Excel)**,
So that **I can quickly populate and maintain the asset registry**.

**Acceptance Criteria:**

**Given** I am in the admin panel's data management section,
**When** I upload a valid CSV/Excel file with asset data,
**Then** the system processes the file and imports/updates assets (FR36).
**And** I receive feedback on the success or failure of the import, including any errors.
**And** the system provides a downloadable template for the import file structure.

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD), Story 1.4 (Role-Based Access Control - Admin access).

**Technical Notes:** Implement a backend function (Supabase Edge Function or custom API if necessary) for processing bulk uploads. Handle data validation and error reporting.

---

## Epic 3: Core Maintenance Flow (OT & Reactive)

**Goal:** Implement the primary process for creating, tracking, and completing maintenance work orders.

### Story 3.1: Mobile Line Notification (NL) Creation (Operator)

As an **operator**,
I want **to quickly report a breakdown from a simplified mobile interface**,
So that **I can notify maintenance efficiently**.

**Acceptance Criteria:**

**Given** I am logged in to the mobile TWA app,
**When** I select "Reportar Avería",
**Then** I can choose the Line and Equipment (asset) from a search/list.
**And** I can select a predefined symptom or type a short description.

**When** I press "Enviar Notificación (NL)",
**Then** the NL is created with minimal touches (< 5 according to PRD NFR7 & UX).
**And** I receive visual feedback of success.

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD), Story 1.2 (User Authentication)

**Technical Notes:** Mobile-first UI (TWA) design. Use `GiantButton` and `SearchInput` with autocompletion. Create `notifications_line` table.

### Story 3.2: Direct Work Order (OT) Creation (Technician/Supervisor)

As a **technician or supervisor**,
I want **to create a work order directly for planned maintenance or improvements**,
So that **I can schedule and assign work without a prior notification**.

**Acceptance Criteria:**

**Given** I have appropriate permissions,
**When** I select "Nueva OT",
**Then** I can specify the asset, type (Preventive/Improvement/Direct Corrective), priority, and optionally assign a technician and scheduled date.

**When** I save,
**Then** the Work Order is created and visible in relevant lists (FR9).

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD), Story 1.4 (Role-Based Access Control)

**Technical Notes:** Create `work_orders` table. Implement a form with asset picker and date/time selectors.

### Story 3.3: Line Notification (NL) to Work Order (OT) Conversion

As a **supervisor**,
I want **to convert a Line Notification into a Work Order**,
So that **I can formalize reactive maintenance requests**.

**Acceptance Criteria:**

**Given** there is an existing NL,
**When** I choose to convert it to an OT,
**Then** a new Work Order is created, pre-filling relevant information from the NL (asset, description, reported by) (FR11).
**And** the NL status is updated to "Converted" or similar.

**Prerequisites:** Story 3.1 (Mobile Line Notification Creation), Story 3.2 (Direct Work Order Creation)

**Technical Notes:** Implement a UI action to link `notifications_line` to `work_orders`.

### Story 3.4: "My Orders" View for Technicians

As a **technician**,
I want **a simplified view of my assigned work orders on my mobile device**,
So that **I can focus on my tasks**.

**Acceptance Criteria:**

**Given** I am a technician,
**When** I access "Mis Órdenes" on my mobile/tablet,
**Then** I see a list of OTs assigned to me, prioritized, with key details like asset, description, and status (FR16).
**And** the view is optimized for mobile (e.g., `TaskCard` UX).

**Prerequisites:** Story 3.2 (Direct Work Order Creation)

**Technical Notes:** Implement `/app/(dashboard)/orders/my-orders` route with mobile-optimized layout.

### Story 3.5: Work Order Tracking & Log (Diagnosis, Actions, Time, Parts)

As a **technician**,
I want **to record my work on an OT, including diagnosis, actions taken, time spent, and parts consumed**,
So that **a complete history is maintained**.

**Acceptance Criteria:**

**Given** I am working on an assigned OT,
**When** I open the OT detail,
**Then** I can input diagnosis, description of actions performed, start/stop a timer for time tracking, and select parts consumed from inventory (FR17).
**And** the consumed parts are reflected in the inventory (linked to FR21).

**Prerequisites:** Story 3.4 ("My Orders" View), Story 5.1 (Spare Parts Catalog)

**Technical Notes:** Extend `work_orders` table or create related `work_logs` and `part_consumptions` tables. Implement timer functionality.

### Story 3.6: Work Order Log/Chat (Bitácora)

As a **team member**,
I want **to add comments and notes to a work order**,
So that **communication and context are preserved across shifts and team members**.

**Acceptance Criteria:**

**Given** I am viewing an OT,
**When** I add a comment to the "Bitácora" section,
**Then** my comment, along with my name and timestamp, is saved to the OT's activity log (FR41).
**And** all team members viewing the OT can see the log.

**Prerequisites:** Story 3.2 (Direct Work Order Creation)

**Technical Notes:** Create a `work_order_logs` table with text content, user_id, and timestamp. Implement real-time updates for the chat (Supabase Realtime potentially for future enhancement).

### Story 3.7: Work Order Closure Request & Supervisor Validation

As a **technician**,
I want **to request closure of a completed work order, and as a supervisor, I want to validate it**,
So that **work completion is formally approved**.

**Acceptance Criteria:**

**Given** a technician has completed work on an OT,
**When** they request closure,
**Then** the OT status changes to "Pending Validation".

**Given** I am a supervisor,
**When** I review a "Pending Validation" OT,
**Then** I can either "Validate" it (changing status to "Closed") or "Reject" it (changing status back to "In Progress" with comments) (FR18).
**And** validation requires correct input of hours and parts (FR18, linked to Success Criteria 3).

**Prerequisites:** Story 3.5 (Work Order Tracking & Log), Story 1.4 (Role-Based Access Control)

**Technical Notes:** Implement status transitions in `work_orders` table. Add UI for supervisor validation.

---

## Epic 4: Visual Planning Canvas

**Goal:** Offer a real-time, visual interface for supervisors to plan, assign, and monitor work orders.

### Story 4.1: Kanban Canvas Display (Basic)

As a **supervisor**,
I want **a visual Kanban board displaying pending work orders and line notifications**,
So that **I can see the current state of maintenance work at a glance**.

**Acceptance Criteria:**

**Given** I am on the Canvas screen,
**When** the page loads,
**Then** I see columns representing work statuses (e.g., "New NLs", "Planned", "In Progress", "Paused", "Blocked") (FR12).
**And** `TaskCard`s representing OTs and NLs are displayed within these columns.
**And** `TaskCard`s are visually distinct for OTs vs NLs.
**And** the Canvas updates in near real-time (NFR2, FR14).

**Prerequisites:** Story 3.3 (Line Notification to Work Order Conversion), Story 3.2 (Direct Work Order Creation)

**Technical Notes:** Utilize Supabase Realtime for `work_orders` and `notifications_line` tables. Implement `useCanvasStore` with Zustand for local UI state. UX: Shadcn/UI `Card` and flexible `div` based column layout.

### Story 4.2: Drag & Drop Work Order Assignment

As a **supervisor**,
I want **to assign and reassign work orders to technicians by dragging and dropping them on the Canvas**,
So that **I can flexibly manage workload**.

**Acceptance Criteria:**

**Given** I am on the Canvas,
**When** I drag a `TaskCard` representing an OT,
**Then** I can drop it onto a technician's lane or another status column (FR13).
**And** the technician assignment and/or work status of the OT is updated in the database.
**And** the Canvas updates visually to reflect the change (FR14).

**Prerequisites:** Story 4.1 (Kanban Canvas Display), Story 1.4 (Role-Based Access Control)

**Technical Notes:** Implement D&D functionality using a UI library that supports it (e.g., `dnd-kit` or similar compatible with Shadcn/UI). Update `work_orders.assigned_user_id` and `work_orders.status` in the backend.

### Story 4.3: Visual Filters for Canvas

As a **supervisor**,
I want **to filter the Canvas by line, priority, and technician**,
So that **I can focus on specific areas or individuals**.

**Acceptance Criteria:**

**Given** I am on the Canvas,
**When** I apply filters for Line, Priority (semáforo), or Technician,
**Then** only relevant `TaskCard`s are displayed (FR15).
**And** the filter controls are intuitive (UX: `Select` components, color-coded buttons).

**Prerequisites:** Story 4.1 (Kanban Canvas Display), Story 2.1 (Multidimensional Asset Structure & CRUD)

**Technical Notes:** Implement client-side filtering on the data fetched for the Canvas. Store filter state in `useCanvasStore`.

### Story 4.4: Blocking Statuses & Notifications

As a **supervisor**,
I want **to mark work orders as blocked (e.g., "Waiting for Spare Part") and notify relevant parties**,
So that **everyone is aware of delays and their causes**.

**Acceptance Criteria:**

**Given** an OT is blocked (e.g., waiting for parts),
**When** a technician or supervisor changes its status to "Blocked by Repuesto",
**Then** the `TaskCard` visually indicates this status (e.g., different color, icon) (FR19).
**And** the system can notify the responsible for parts or purchasing (FR24, linked).

**Prerequisites:** Story 4.1 (Kanban Canvas Display), Story 3.5 (Work Order Tracking & Log)

**Technical Notes:** Define specific blocking statuses in `work_orders.status` enum. Implement simple notification trigger.

---

## Epic 5: Inventory & Spare Parts Management

**Goal:** Manage the catalog, stock levels, and consumption of spare parts.

### Story 5.1: Spare Parts Catalog & CRUD

As an **administrator**,
I want **to manage a catalog of spare parts with structured coding and essential details**,
So that **parts can be easily identified and tracked**.

**Acceptance Criteria:**

**Given** I am in the Inventory Management section,
**When** I access the "Spare Parts Catalog",
**Then** I can create, read, update, and delete spare part entries (FR20).
**And** each part includes a unique code, description, and unit of measure.
**And** the catalog supports searching and filtering.

**Prerequisites:** Story 1.4 (Role-Based Access Control)

**Technical Notes:** Create `spare_parts` table with `code`, `description`, `unit_of_measure`, `min_stock_level`, `quantity_on_hand`, etc.

### Story 5.2: Automatic Stock Deduction on Work Order

As a **technician**,
When I **record parts consumed during a work order, I want the system to automatically deduct those parts from inventory**,
So that **stock levels are always up-to-date**.

**Acceptance Criteria:**

**Given** I am completing an OT and specify parts consumed,
**When** the OT is saved or progresses to a certain status,
**Then** the `quantity_on_hand` for each specified part is reduced in the `spare_parts` inventory (FR21).
**And** the deduction is recorded in a `stock_movements` log.

**Prerequisites:** Story 3.5 (Work Order Tracking & Log), Story 5.1 (Spare Parts Catalog)

**Technical Notes:** Implement a database trigger or backend logic to update stock levels upon part consumption. Ensure transactional consistency.

### Story 5.3: Low Stock Alerts

As an **inventory manager**,
I want **to be alerted when spare part stock falls below a predefined minimum**,
So that **I can reorder parts before they run out**.

**Acceptance Criteria:**

**Given** a spare part has a defined `min_stock_level`,
**When** its `quantity_on_hand` falls below this level (due to consumption or adjustment),
**Then** a visual alert is triggered in the inventory dashboard (FR22).
**And** a notification is sent to responsible personnel (FR24, linked).

**Prerequisites:** Story 5.1 (Spare Parts Catalog), Story 5.2 (Automatic Stock Deduction)

**Technical Notes:** Add `min_stock_level` to `spare_parts` table. Implement a database function or scheduled job to check stock levels and trigger alerts/notifications (e.g., via Supabase Edge Function).

### Story 5.4: Controlled Stock Receipt (Entry Management)

As an **administrator or authorized personnel**,
I want **to accurately record the receipt of new spare parts, linking them to purchase orders where applicable**,
So that **stock levels are correctly updated**.

**Acceptance Criteria:**

**Given** I am in the Inventory Management section,
**When** I perform a "Stock Receipt" operation,
**Then** I can specify the received part, quantity, and optionally link it to a Purchase Order (FR23).
**And** the `quantity_on_hand` for the part is increased.
**And** a `stock_movements` log is created.
**And** technicians/supervisors can only receive against existing Purchase Orders.
**And** administrators can perform "initial loads" or "direct entries" without a PO (FR23).

**Prerequisites:** Story 5.1 (Spare Parts Catalog), Story 8.2 (Purchase Order Generation - for PO linkage)

**Technical Notes:** Implement a `stock_receipts` table. Implement role-based logic for different receipt flows via RLS.

### Story 5.5: Stock Regularization (Manual Adjustments)

As an **authorized user**,
I want **to perform manual adjustments to inventory levels (regularization) with an audited reason**,
So that **discrepancies between physical and system stock can be corrected**.

**Acceptance Criteria:**

**Given** I have appropriate permissions (Admin, Supervisor, Technician),
**When** I perform a "Regularización" operation for a spare part,
**Then** I can adjust the `quantity_on_hand` (increase or decrease) and must provide a reason (e.g., "Rotura", "Conteo Cíclico", "Pérdida") (FR35).
**And** the adjustment is recorded in the `stock_movements` log with the reason.

**Prerequisites:** Story 5.1 (Spare Parts Catalog), Story 1.4 (Role-Based Access Control)

**Technical Notes:** Implement a UI for stock adjustments and update `stock_movements` table with adjustment reasons. RLS for granular permission control (FR38 applies here).

---

## Epic 6: Advanced Flows & Rotables

**Goal:** Implement specialized maintenance processes, including rotable component management and external services.

### Story 6.1: Rotable Component Substitution

As a **technician**,
I want **to perform a "Sustitución de Componente" within a Work Order**,
So that **I can replace a faulty rotable unit with a new one and initiate its recovery cycle**.

**Acceptance Criteria:**

**Given** I am working on an OT and need to replace a rotable component,
**When** I select "Sustitución de Componente",
**Then** the system guides me to select the new unit from stock (deducting it) and identify the removed unit as "A Recuperar" (FR31).
**And** the removed unit is tracked, not discarded.

**Prerequisites:** Story 3.5 (Work Order Tracking & Log), Story 5.1 (Spare Parts Catalog)

**Technical Notes:** Extend `part_consumptions` or create a new `rotable_movements` table. Add a status to `rotable_components` (e.g., 'Installed', 'A Recuperar', 'In Repair', 'Repaired').

### Story 6.2: Rotable Recovery Cycle (Repair Request)

As a **maintenance manager**,
I want **the system to automatically initiate a repair workflow for rotable units marked "A Recuperar"**,
So that **these valuable components are repaired and returned to stock efficiently**.

**Acceptance Criteria:**

**Given** a rotable unit is marked "A Recuperar" (from Story 6.1),
**When** the OT is closed or validated,
**Then** a "Solicitud de Reparación" (Line Notification for workshop/repair) is automatically generated for that specific unit (FR32).
**And** this request follows a workflow for internal or external repair and eventual re-entry into stock.

**Prerequisites:** Story 6.1 (Rotable Component Substitution), Story 3.1 (Mobile Line Notification Creation - as basis for repair request).

**Technical Notes:** Implement a background process or database trigger to create an NL for repair when a rotable status changes.

### Story 6.3: External N5 Service Assignment & Tracking

As a **supervisor**,
I want **to assign work orders to registered "Empresas Externas" (N5)**,
So that **I can manage outsourced maintenance work**.

**Acceptance Criteria:**

**Given** I am creating or editing an OT,
**When** I indicate it requires external service (N5),
**Then** I can select a registered "Empresa Externa" from a list (FR10).
**And** the OT is visually marked as "Externa" in the Canvas and assigned to a specific external service column.
**And** internal technicians cannot be assigned to external OTs.
**And** the closure of external OTs requires manual validation of external work.

**Prerequisites:** Story 3.2 (Direct Work Order Creation), Story 1.4 (Role-Based Access Control), Story 1.3 (User Management to define external companies - potentially new "External Providers" table).

**Technical Notes:** Create `external_providers` table. Add `external_provider_id` to `work_orders`. RLS for external provider access.

---

## Epic 7: Compliance & Non-Conformities

**Goal:** Ensure regulatory adherence and systematic management of non-conformities.

### Story 7.1: Compliance Calendar for Critical Assets

As a **safety manager**,
I want **to manage a calendar of legal compliance events for critical assets**,
So that **I can track certification expirations and ensure regulatory adherence**.

**Acceptance Criteria:**

**Given** I am in the compliance section,
**When** I view the Compliance Calendar,
**Then** I see upcoming and overdue compliance events (e.g., inspections, certifications) for critical assets (FR26).
**And** the system sends alerts for approaching expiration dates (FR24, linked).
**And** I can add/edit compliance events for specific assets.

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD), Story 1.4 (Role-Based Access Control)

**Technical Notes:** Create `compliance_events` table linked to `assets`. Implement date-based reminders and notifications.

### Story 7.2: Non-Conformity (NC) Registry & Classification

As a **quality manager**,
I want **to record and classify non-conformities found during inspections**,
So that **I can track issues and manage their resolution**.

**Acceptance Criteria:**

**Given** I am in the quality management section,
**When** I create a new Non-Conformity (NC) record,
**Then** I can link it to an asset, classify its severity, and set a resolution deadline (FR27).
**And** the NC is stored in a searchable register.

**Prerequisites:** Story 2.1 (Multidimensional Asset Structure & CRUD), Story 1.4 (Role-Based Access Control)

**Technical Notes:** Create `non_conformities` table with fields for asset_id, severity, deadline, description.

### Story 7.3: Non-Conformity (NC) to Work Order (OT) Linkage

As a **supervisor**,
I want **to generate a Work Order directly from a Non-Conformity record**,
So that **corrective actions are efficiently initiated and linked to the original issue**.

**Acceptance Criteria:**

**Given** I am viewing a Non-Conformity record,
**When** I select "Generar OT Correctiva",
**Then** a new Work Order is created, pre-filling asset and description from the NC (FR28).
**And** the NC and OT are linked, and the NC status changes to "Pending OT Resolution".

**Prerequisites:** Story 7.2 (Non-Conformity Registry), Story 3.2 (Direct Work Order Creation)

**Technical Notes:** Add `non_conformity_id` FK to `work_orders` table.

### Story 7.4: NC Closure Blocking & Document Repository

As a **quality manager**,
I want **to prevent the closure of a Non-Conformity until its linked corrective Work Order is validated, and access relevant documents directly from the asset**.

**Acceptance Criteria:**

**Given** an NC is linked to an OT,
**When** I attempt to close the NC and the linked OT is not "Closed" and "Validated",
**Then** the system prevents NC closure (FR29).

**Given** I am viewing an asset,
**When** I access its document repository,
**Then** I can see and download specific legal certificates and inspection reports (FR30).

**Prerequisites:** Story 7.3 (NC to OT Linkage), Story 2.2 (Asset Technical Sheet & Documentation)

**Technical Notes:** Implement RLS for NC closure. Ensure `work_orders.status` is checked. Integrate document storage with specific categories for legal docs.

---

## Epic 8: Procurement Integration

**Goal:** Streamline the process of identifying, requesting, and purchasing necessary parts and services.

### Story 8.1: Procurement Needs Management Panel

As a **purchasing manager**,
I want **a centralized panel displaying all procurement needs (automatic stock alerts, manual technician requests)**,
So that **I can efficiently manage purchasing decisions**.

**Acceptance Criteria:**

**Given** I am in the procurement section,
**When** I view the "Needs Management" panel,
**Then** I see a consolidated list of items required, indicating if they are from a low stock alert (FR22) or a manual request (FR33).
**And** I can filter and sort these needs.

**Prerequisites:** Story 5.3 (Low Stock Alerts), Story 3.5 (Work Order Tracking & Log - for manual part requests).

**Technical Notes:** Create `procurement_needs` table, populated from `spare_parts` (low stock) and `work_orders` (manual requests).

### Story 8.2: Purchase Order (OC) Generation

As a **purchasing manager**,
I want **to group multiple procurement needs into a single Purchase Order (OC) by vendor**,
So that **I can generate official orders for suppliers**.

**Acceptance Criteria:**

**Given** I have selected multiple procurement needs from the management panel,
**When** I choose to "Generar Orden de Compra",
**Then** a new Purchase Order is created, grouping selected items for a chosen vendor (FR34).
**And** the PO is assigned a unique identifier (e.g., `OC-XXXX`) and a status ("Pedida / En Curso").
**And** the system can optionally generate a PDF for the PO.

**Prerequisites:** Story 8.1 (Procurement Needs Management Panel)

**Technical Notes:** Create `purchase_orders` table linked to `procurement_needs` and `external_providers` (for vendors).

---

## Epic 9: Analytics, Reporting & Display

**Goal:** Provide key performance indicators, data export, and factory-wide visual management.

### Story 9.1: KPI Dashboard (MTTR, MTBF, Availability)

As a **plant manager**,
I want **to view key maintenance KPIs like MTTR, MTBF, and Availability on an interactive dashboard**,
So that **I can monitor plant performance and make data-driven decisions**.

**Acceptance Criteria:**

**Given** I am on the KPI Dashboard,
**When** the dashboard loads,
**Then** I see visualizations of MTTR (Mean Time To Repair), MTBF (Mean Time Between Failures), and Asset Availability (FR39).
**And** these KPIs are calculated based on work order data (timestamps, asset history).
**And** I can filter data by date range or asset.

**Prerequisites:** Story 3.5 (Work Order Tracking & Log), Story 2.1 (Multidimensional Asset Structure & CRUD)

**Technical Notes:** Implement database views or functions to calculate KPIs. Use a charting library (e.g., Recharts, Nivo) for visualizations.

### Story 9.2: Data Export to CSV

As an **administrator**,
I want **to export lists of work orders and stock movements to CSV format**,
So that **I can perform external analysis or reporting**.

**Acceptance Criteria:**

**Given** I am viewing a list of work orders or stock movements,
**When** I click the "Exportar CSV" button,
**Then** a CSV file containing the displayed data is downloaded (FR37).
**And** the export includes all relevant columns.

**Prerequisites:** Story 3.2 (Direct Work Order Creation), Story 5.2 (Automatic Stock Deduction)

**Technical Notes:** Implement client-side or server-side CSV generation for various data tables.

### Story 9.3: TV / Kiosk Mode for Plant Displays

As a **plant manager**,
I want **to display key operational data on large screens in the plant in a high-contrast, rotating view**,
So that **all personnel are informed about real-time status**.

**Acceptance Criteria:**

**Given** a display user is logged in to a large screen (e.g., Smart TV),
**When** the system is set to "Modo TV / Kiosco",
**Then** it displays a high-contrast view of selected KPIs or operational summaries (FR40).
**And** the view rotates automatically through different panels/KPIs at configurable intervals.
**And** this mode is read-only and requires a specific "Display" user (FR40, linked to FR1).

**Prerequisites:** Story 9.1 (KPI Dashboard), Story 1.4 (Role-Based Access Control)

**Technical Notes:** Implement a dedicated display route `/app/(display)/kiosk`. Ensure high-contrast styling and automatic content rotation.

---



---

## FR Coverage Matrix

| FR ID | Description | Epic(s) Covered | Story(ies) Covered |
|---|---|---|---|
| FR1 | User Access by Roles (Operator, Technician, Supervisor, Admin) | Epic 1 | 1.4 Role-Based Access Control (Basic) |
| FR2 | Technical Capacity Levels (N1-N5) | Epic 1 | 1.5 Technical Capacity Levels (N1-N5) |
| FR3 | User Invitation & Registration | Epic 1 | 1.3 User Registration & Invitation (Admin) |
| FR4 | Persistent Authentication (Supabase Auth) | Epic 1 | 1.2 User Authentication (Login/Logout) |
| FR5 | Multidimensional Asset Structure (Hierarchy, Families, Systems) | Epic 2 | 2.1 Multidimensional Asset Structure & CRUD |
| FR6 | Asset Technical Sheet & History | Epic 2 | 2.2 Asset Technical Sheet & Documentation |
| FR7 | Predictive Asset Search | Epic 2 | 2.3 Predictive Asset Search |
| FR8 | Reactive Flow (Line Notification creation) | Epic 3 | 3.1 Mobile Line Notification (NL) Creation (Operator) |
| FR9 | Direct Flow (Work Order creation) | Epic 3 | 3.2 Direct Work Order (OT) Creation (Technician/Supervisor) |
| FR10 | External Flow (N5/External Providers) | Epic 6 | 6.3 External N5 Service Assignment & Tracking |
| FR11 | Conversion NL -> OT | Epic 3 | 3.3 Line Notification (NL) to Work Order (OT) Conversion |
| FR12 | Visual Canvas (Kanban Board) | Epic 4 | 4.1 Kanban Canvas Display (Basic) |
| FR13 | Canvas Drag & Drop Assignment | Epic 4 | 4.2 Drag & Drop Work Order Assignment |
| FR14 | Real-time Canvas States | Epic 4 | 4.1 Kanban Canvas Display (Basic), 4.2 Drag & Drop Work Order Assignment |
| FR15 | Canvas Filters | Epic 4 | 4.3 Visual Filters for Canvas |
| FR16 | Technician "My Orders" View | Epic 3 | 3.4 "My Orders" View for Technicians |
| FR17 | Work Log (Diagnosis, Actions, Time, Parts) | Epic 3 | 3.5 Work Order Tracking & Log (Diagnosis, Actions, Time, Parts) |
| FR18 | Closure Request & Validation Flow | Epic 3 | 3.7 Work Order Closure Request & Supervisor Validation |
| FR19 | Blocking States Management | Epic 4 | 4.4 Blocking Statuses & Notifications |
| FR20 | Spare Parts Catalog | Epic 5 | 5.1 Spare Parts Catalog & CRUD |
| FR21 | Automatic Stock Deduction | Epic 5 | 5.2 Automatic Stock Deduction on Work Order |
| FR22 | Low Stock Alerts | Epic 5, Epic 8 | 5.3 Low Stock Alerts, 8.1 Procurement Needs Management Panel |
| FR23 | Stock Receipt (Entry Management) | Epic 5 | 5.4 Controlled Stock Receipt (Entry Management) |
| FR24 | Critical Notifications | Epic 5, Epic 7 | 5.3 Low Stock Alerts, 7.1 Compliance Calendar for Critical Assets |
| FR25 | Actionable Notifications | *Implicit* | *Addressed within notification functionality across relevant stories.* |
| FR26 | Compliance Calendar | Epic 7 | 7.1 Compliance Calendar for Critical Assets |
| FR27 | Non-Conformities (NC) Registry | Epic 7 | 7.2 Non-Conformity (NC) Registry & Classification |
| FR28 | Flow NC -> OT | Epic 7 | 7.3 Non-Conformity (NC) to Work Order (OT) Linkage |
| FR29 | NC Closure Blocking Logic | Epic 7 | 7.4 NC Closure Blocking & Document Repository |
| FR30 | Legal Document Repository per Asset | Epic 7 | 7.4 NC Closure Blocking & Document Repository |
| FR31 | Rotable Substitution | Epic 6 | 6.1 Rotable Component Substitution |
| FR32 | Recovery Cycle (Repair Request) | Epic 6 | 6.2 Rotable Recovery Cycle (Repair Request) |
| FR33 | Procurement Needs Management | Epic 8 | 8.1 Procurement Needs Management Panel |
| FR34 | Purchase Order Generation | Epic 8 | 8.2 Purchase Order (OC) Generation |
| FR35 | Stock Regularization (Adjustments) | Epic 5 | 5.5 Stock Regularization (Manual Adjustments) |
| FR36 | Bulk Data Import | Epic 2 | 2.4 Bulk Asset Data Import (Admin) |
| FR37 | Data Export (CSV) | Epic 9 | 9.2 Data Export to CSV |
| FR38 | Granular Permissions | Epic 1 | 1.4 Role-Based Access Control (Basic) - Further stories will enhance granular control |
| FR39 | KPI Dashboard | Epic 9 | 9.1 KPI Dashboard (MTTR, MTBF, Availability) |
| FR40 | TV / Kiosk Mode | Epic 9 | 9.3 TV / Kiosk Mode for Plant Displays |
| FR41 | Work Order Log/Chat | Epic 3 | 3.6 Work Order Log/Chat (Bitácora) |

---

## Summary

This Epic and Story breakdown provides a comprehensive plan for the GMAO MVP v1, aligning with the Product Requirements Document, UX Design Specification, and Architectural Decisions.

**Key Achievements:**
- A clear, value-driven epic structure has been defined, avoiding technical layer anti-patterns.
- All functional requirements (FRs) from the PRD have been mapped to specific epics and detailed stories, ensuring complete coverage (with notes on deferred/implicit FRs).
- Each story is scoped for a single developer agent session, facilitating agile development.
- Acceptance Criteria are provided in a BDD format, making them clear, testable, and actionable.
- Technical notes and prerequisites offer guidance for implementation, integrating architectural decisions and UX design patterns.

**Next Steps & Considerations:**
- **FR25 (Actionable Notifications):** This is integrated into the notification stories (e.g., in Epic 5 and Epic 7), ensuring notifications lead to relevant application elements.
- This document serves as the foundation for Phase 4 Implementation. Individual stories can now be picked up by development agents.
- Further refinement will occur as UX design and architecture details evolve, especially regarding component interactions and deeper technical integrations.

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._

_This document will be updated after UX Design and Architecture workflows to incorporate interaction details and technical decisions._
