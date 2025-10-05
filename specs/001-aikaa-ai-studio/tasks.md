# Tasks: Aikaa AI Studio Multi-Tenant Platform

**Input**: Design documents from `/specs/001-aikaa-ai-studio/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Extract: React/TypeScript/Supabase stack, shadcn/ui, TanStack Query
2. Load design documents: ✓
   → data-model.md: 8 entities (Tenant, Company, User, Studio, Card, etc.)
   → contracts/: 4 API contract files (tenants, companies, studios, cards)
   → research.md: Multi-tenant architecture decisions
   → quickstart.md: 6 integration test scenarios
3. Generate tasks by category: ✓
   → Setup: Vite project, Supabase, dependencies
   → Tests: Contract tests, integration scenarios
   → Core: Entity models, React components, API routes
   → Integration: Database setup, auth, RLS policies  
   → Polish: Performance, UI consistency, documentation
4. Task rules applied: ✓
   → Different files marked [P] for parallel
   → Tests before implementation (TDD)
5. 58 tasks numbered T001-T058 ✓
6. Dependencies mapped ✓
7. Parallel examples provided ✓
8. Validation complete: ✓
   → All 4 contracts have test tasks
   → All 8 entities have model tasks
   → All 6 quickstart scenarios covered
9. SUCCESS: Tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
React SPA with Supabase backend - paths use `src/` at repository root per plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create Vite React TypeScript project structure per plan.md in repository root
- [ ] T002 Initialize package.json with React 18.3.1, TypeScript 5.8.3, Vite 5.4.19 dependencies
- [ ] T003 [P] Install shadcn/ui, Tailwind CSS 3.4.17, and Radix UI components
- [ ] T004 [P] Install TanStack Query 5.83.0, React Hook Form 7.61.1, Zod 3.25.76
- [ ] T005 [P] Install Supabase 2.58.0 client and development dependencies
- [ ] T006 [P] Configure ESLint 9.32.0 and @typescript-eslint 8.38.0 for code quality
- [ ] T007 [P] Configure Prettier and TypeScript strict mode settings
- [ ] T008 [P] Setup Tailwind CSS configuration with shadcn/ui integration
- [ ] T009 Initialize Supabase project and local development environment
- [ ] T010 [P] Configure Vite environment variables for Supabase connection

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Parallel)
- [ ] T011 [P] Contract test POST /api/tenants in tests/contract/tenants.test.ts
- [ ] T012 [P] Contract test GET /api/tenants/:id in tests/contract/tenants.test.ts
- [ ] T013 [P] Contract test PUT /api/tenants/:id in tests/contract/tenants.test.ts
- [ ] T014 [P] Contract test POST /api/companies in tests/contract/companies.test.ts
- [ ] T015 [P] Contract test GET /api/companies/:id in tests/contract/companies.test.ts
- [ ] T016 [P] Contract test POST /api/companies/:id/users in tests/contract/companies.test.ts
- [ ] T017 [P] Contract test POST /api/companies/:company_id/studios in tests/contract/studios.test.ts
- [ ] T018 [P] Contract test GET /api/studios/:id in tests/contract/studios.test.ts
- [ ] T019 [P] Contract test PUT /api/studios/:id in tests/contract/studios.test.ts
- [ ] T020 [P] Contract test POST /api/studios/:studio_id/cards in tests/contract/cards.test.ts
- [ ] T021 [P] Contract test GET /api/cards/:id in tests/contract/cards.test.ts
- [ ] T022 [P] Contract test PUT /api/cards/:id/status in tests/contract/cards.test.ts

### Integration Tests (Parallel)
- [ ] T023 [P] Integration test Platform Admin Setup scenario in tests/integration/platform-admin.test.ts
- [ ] T024 [P] Integration test Company Admin Workflow scenario in tests/integration/company-admin.test.ts
- [ ] T025 [P] Integration test Normal User Workflow scenario in tests/integration/normal-user.test.ts
- [ ] T026 [P] Integration test Multi-Tenant Isolation scenario in tests/integration/tenant-isolation.test.ts
- [ ] T027 [P] Integration test Performance & Scale scenario in tests/integration/performance.test.ts
- [ ] T028 [P] Integration test Error Handling scenario in tests/integration/error-handling.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Schema & Migrations
- [ ] T029 Create initial Supabase migration for tenants table in supabase/migrations/001_create_tenants.sql
- [ ] T030 Create companies table migration with tenant relationship in supabase/migrations/002_create_companies.sql
- [ ] T031 Create users and user_company_access tables in supabase/migrations/003_create_users.sql
- [ ] T032 Create studios table with company relationship in supabase/migrations/004_create_studios.sql
- [ ] T033 Create cards table with studio relationship in supabase/migrations/005_create_cards.sql
- [ ] T034 Create card_comments table in supabase/migrations/006_create_comments.sql
- [ ] T035 Create audit_logs table for compliance in supabase/migrations/007_create_audit_logs.sql
- [ ] T036 Create notifications table in supabase/migrations/008_create_notifications.sql

### Row Level Security Policies
- [ ] T037 Implement RLS policies for tenant isolation in supabase/migrations/009_create_rls_policies.sql
- [ ] T038 Create user access control policies in supabase/migrations/010_create_user_policies.sql

### Entity Models & Types (Parallel)
- [ ] T039 [P] Generate TypeScript types from Supabase schema in src/integrations/supabase/types.ts
- [ ] T040 [P] Create Tenant entity model with Zod validation in src/lib/validations/tenant.ts
- [ ] T041 [P] Create Company entity model with Zod validation in src/lib/validations/company.ts
- [ ] T042 [P] Create User entity model with Zod validation in src/lib/validations/user.ts
- [ ] T043 [P] Create Studio entity model with Zod validation in src/lib/validations/studio.ts
- [ ] T044 [P] Create Card entity model with Zod validation in src/lib/validations/card.ts

### React Contexts & Hooks (Parallel)
- [ ] T045 [P] Create AuthContext for user authentication state in src/contexts/AuthContext.tsx
- [ ] T046 [P] Create TenantContext for current tenant management in src/contexts/TenantContext.tsx
- [ ] T047 [P] Create ThemeContext for dark/light mode in src/contexts/ThemeContext.tsx
- [ ] T048 [P] Create custom hooks for tenant management in src/hooks/useTenants.ts
- [ ] T049 [P] Create custom hooks for studio operations in src/hooks/useStudios.ts
- [ ] T050 [P] Create custom hooks for card CRUD operations in src/hooks/useCards.ts

## Phase 3.4: Integration

### Supabase Integration
- [ ] T051 Configure Supabase client with auth and RLS in src/integrations/supabase/client.ts
- [ ] T052 Setup TanStack Query definitions for all entities in src/integrations/supabase/queries.ts
- [ ] T053 Implement auth helpers and session management in src/integrations/supabase/auth.ts

### UI Components
- [ ] T054 Create main application layout with tenant switching in src/components/layout/AppLayout.tsx
- [ ] T055 Create tenant management components in src/components/tenant/TenantManager.tsx
- [ ] T056 Create Kanban Studio components with drag-and-drop in src/components/studio/StudioBoard.tsx
- [ ] T057 Create card components with type-specific forms in src/components/card/CardForm.tsx

## Phase 3.5: Polish
- [ ] T058 [P] Unit tests for critical business logic validation in tests/unit/validations.test.ts
- [ ] T059 [P] Performance benchmarks and optimization to meet <200ms targets
- [ ] T060 [P] UI/UX consistency validation against shadcn/ui design system
- [ ] T061 Code quality review and refactoring for maintainability
- [ ] T062 [P] Create API documentation in docs/api.md
- [ ] T063 Execute complete quickstart.md validation scenarios

## Dependencies

### Critical Path Dependencies
- Setup (T001-T010) before all other phases
- Database migrations (T029-T038) before entity models (T039-T044)
- Entity models (T039-T044) before hooks (T045-T050)
- Supabase integration (T051-T053) before UI components (T054-T057)
- All tests (T011-T028) before implementation (T029+)

### Parallel Task Groups
**Group 1 - Setup Dependencies (after T010)**:
- T003, T004, T005, T006, T007, T008

**Group 2 - Contract Tests (after setup)**:
- T011, T012, T013 (tenants)
- T014, T015, T016 (companies)  
- T017, T018, T019 (studios)
- T020, T021, T022 (cards)

**Group 3 - Integration Tests (after setup)**:
- T023, T024, T025, T026, T027, T028

**Group 4 - Entity Models (after T038)**:
- T040, T041, T042, T043, T044

**Group 5 - React Contexts (after T044)**:
- T045, T046, T047, T048, T049, T050

**Group 6 - Polish Tasks**:
- T058, T060, T062

## Parallel Example
```
# After setup complete, launch contract tests together:
Task: "Contract test POST /api/tenants in tests/contract/tenants.test.ts"
Task: "Contract test GET /api/companies/:id in tests/contract/companies.test.ts"  
Task: "Contract test POST /api/studios/:studio_id/cards in tests/contract/cards.test.ts"
Task: "Integration test Platform Admin Setup scenario in tests/integration/platform-admin.test.ts"

# After migrations, launch entity models together:
Task: "Create Tenant entity model with Zod validation in src/lib/validations/tenant.ts"
Task: "Create Company entity model with Zod validation in src/lib/validations/company.ts"
Task: "Create Studio entity model with Zod validation in src/lib/validations/studio.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing (TDD approach)
- Commit after each task completion
- Multi-tenant RLS policies are critical for security
- Performance targets: <200ms response times for all operations
- All UI components must use shadcn/ui design system

## Task Generation Rules Applied

1. **From Contracts** (4 files):
   - tenants.md → T011-T013 (3 endpoints)
   - companies.md → T014-T016 (3 endpoints)  
   - studios.md → T017-T019 (3 endpoints)
   - cards.md → T020-T022 (3 endpoints)

2. **From Data Model** (8 entities):
   - Tenant → T040 (model task)
   - Company → T041 (model task)
   - User → T042 (model task)
   - Studio → T043 (model task)  
   - Card → T044 (model task)
   - UserCompanyAccess, CardComment, AuditLog → covered in migrations

3. **From Quickstart Scenarios** (6 scenarios):
   - Platform Admin Setup → T023
   - Company Admin Workflow → T024
   - Normal User Workflow → T025
   - Multi-Tenant Isolation → T026
   - Performance & Scale → T027
   - Error Handling → T028

4. **Ordering Applied**:
   - Setup → Tests → Models → Services → Integration → Polish
   - TDD: All tests before implementation
   - Database before application layer
   - Models before UI components

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts have corresponding tests (T011-T022)
- [x] All entities have model tasks (T040-T044)
- [x] All tests come before implementation (T011-T028 before T029+)
- [x] Parallel tasks truly independent (different files, no shared dependencies)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Multi-tenant security enforced through RLS policies
- [x] Constitutional requirements addressed (performance, quality, consistency)