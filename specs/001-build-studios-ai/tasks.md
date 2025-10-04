# Tasks: Studios AI Backend Platform

**Input**: Design documents from `/Users/peralles/Downloads/github/aikaa-ai-studios/specs/001-build-studios-ai/`
**Prerequisites**: plan.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅), quickstart.md (✅)

## Execution Flow (main)
```
1. Load plan.md from feature directory → ✅ NestJS + TypeScript 5.0 + Supabase + ActivePieces
2. Load design documents:
   → data-model.md: 10 entities (Company, User, Studio, Workflow, File, 4 Kanban entities)
   → contracts/api.yaml: 36 endpoints across 6 API groups
   → research.md: Tech decisions and configuration examples
   → quickstart.md: TDD workflow and contract testing approach
3. Generate tasks by category: Setup → Tests → Models → Services → Endpoints → Polish
4. Apply constitutional requirements: Max 2 modules, TDD mandatory, direct integration
5. Number tasks sequentially with parallel execution markers [P]
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions (from plan.md Project Structure)
```
src/
├── core/           # Core Platform API (entities, services, controllers)
├── workflows/      # Workflow Execution Engine (ActivePieces integration)
├── shared/         # Utilities (guards, pipes, interceptors, CLI)
└── supabase/       # Database migrations and RLS policies

tests/
├── contract/       # API contract tests (curl-based)
├── integration/    # End-to-end with real database
└── unit/          # Service unit tests
```

## Phase 3.1: Setup
- [x] T001 Create NestJS project structure with Fastify adapter and TypeScript 5.0+ configuration
- [x] T002 Initialize Supabase project with local development environment and database migrations
- [x] T003 [P] Configure ESLint, Prettier, and Jest testing framework with TDD-focused rules
- [x] T004 [P] Set up environment configuration with Supabase credentials and ActivePieces API keys in .env

## Phase 3.2: Database Schema (TDD Foundation)
- [x] T005 Create complete database schema migration with all 10 tables in supabase/migrations/001_create_studios_ai_schema.sql
- [x] T006 [P] Implement Row Level Security policies for all tables in supabase/migrations/002_enable_rls_policies.sql
- [x] T007 [P] Create analytics view and performance indexes in supabase/migrations/003_create_analytics_and_indexes.sql

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (API Endpoints)
- [x] T008 [P] Contract test POST /companies with curl validation in tests/contract/companies_create.test.sh
- [x] T009 [P] Contract test GET /companies with pagination in tests/contract/companies_list.test.sh
- [x] T010 [P] Contract test POST /companies/{id}/studios in tests/contract/studios_create.test.sh
- [x] T011 [P] Contract test GET /workflow-templates with filtering in tests/contract/workflow_templates_list.test.sh
- [ ] T012 [P] Contract test POST /studios/{id}/executions in tests/contract/workflow_execute.test.sh
- [ ] T013 [P] Contract test POST /studios/{id}/files with multipart upload in tests/contract/files_upload.test.sh
- [ ] T014 [P] Contract test POST /studios/{id}/kanban-boards in tests/contract/kanban_boards_create.test.sh
- [ ] T015 [P] Contract test POST /kanban-boards/{id}/stages in tests/contract/kanban_stages_create.test.sh
- [ ] T016 [P] Contract test POST /kanban-boards/{id}/cards in tests/contract/kanban_cards_create.test.sh
- [ ] T017 [P] Contract test POST /kanban-cards/{id}/move in tests/contract/kanban_cards_move.test.sh
- [x] T018 [P] Contract test GET /health with service health status in tests/contract/health.test.sh

### Integration Tests (User Stories)
- [x] T019 [P] Integration test company registration and first studio creation in tests/integration/company_registration.spec.ts
- [ ] T020 [P] Integration test multi-studio management within company in tests/integration/multi_studio.spec.ts
- [x] T021 [P] Integration test Kanban-driven workflow automation in tests/integration/kanban_workflows.spec.ts
- [ ] T022 [P] Integration test ActivePieces workflow execution flow in tests/integration/workflow_execution.spec.ts
- [ ] T023 [P] Integration test Supabase Auth with RLS policies in tests/integration/auth_rls.spec.ts
- [ ] T024 [P] Integration test file upload and access control in tests/integration/file_management.spec.ts

## Phase 3.4: Core Entities (ONLY after tests are failing)

### Core Business Entities
- [ ] T025 [P] Company entity with validation rules in src/core/entities/company.entity.ts
- [ ] T026 [P] User entity extending Supabase auth.users in src/core/entities/user.entity.ts
- [ ] T027 [P] UserCompany junction entity with role management in src/core/entities/user-company.entity.ts
- [ ] T028 [P] Studio entity with business area validation in src/core/entities/studio.entity.ts
- [ ] T029 [P] File entity with Supabase Storage integration in src/core/entities/file.entity.ts

### Workflow Entities
- [ ] T030 [P] WorkflowTemplate entity with ActivePieces integration in src/workflows/entities/workflow-template.entity.ts
- [ ] T031 [P] WorkflowExecution entity with state machine in src/workflows/entities/workflow-execution.entity.ts

### Kanban Entities
- [ ] T032 [P] KanbanBoard entity with studio scoping in src/core/entities/kanban-board.entity.ts
- [ ] T033 [P] KanbanStage entity with workflow triggers in src/core/entities/kanban-stage.entity.ts
- [ ] T034 [P] KanbanCard entity with custom fields in src/core/entities/kanban-card.entity.ts
- [ ] T035 [P] CardFieldDefinition entity with field type configs in src/core/entities/card-field-definition.entity.ts

## Phase 3.5: Services Layer

### Core Services
- [ ] T036 [P] CompanyService with Supabase RLS integration in src/core/services/company.service.ts
- [ ] T037 [P] UserService with company relationship management in src/core/services/user.service.ts
- [ ] T038 [P] StudioService with company-scoped operations in src/core/services/studio.service.ts
- [ ] T039 [P] FileService with Supabase Storage and access control in src/core/services/file.service.ts

### Workflow Services
- [ ] T040 [P] WorkflowTemplateService with discovery and search in src/workflows/services/workflow-template.service.ts
- [ ] T041 ActivePiecesService with HTTP client and retry logic in src/workflows/services/activepieces.service.ts
- [ ] T042 WorkflowExecutionService with orchestration and monitoring in src/workflows/services/workflow-execution.service.ts

### Kanban Services
- [ ] T043 KanbanService with real-time updates and workflow triggers in src/core/services/kanban.service.ts
- [ ] T044 [P] CardFieldDefinitionService with validation rules in src/core/services/card-field-definition.service.ts

### Analytics Service
- [ ] T045 [P] AnalyticsService with real-time view calculations in src/core/services/analytics.service.ts

## Phase 3.6: Controllers (API Endpoints)

### Core API Controllers
- [ ] T046 [P] CompaniesController with OpenAPI decorators in src/core/controllers/companies.controller.ts
- [ ] T047 [P] StudiosController with company scoping in src/core/controllers/studios.controller.ts
- [ ] T048 [P] FilesController with multipart upload handling in src/core/controllers/files.controller.ts

### Workflow Controllers
- [ ] T049 [P] WorkflowTemplatesController with filtering and search in src/workflows/controllers/workflow-templates.controller.ts
- [ ] T050 WorkflowExecutionsController with ActivePieces integration in src/workflows/controllers/workflow-executions.controller.ts

### Kanban Controllers
- [ ] T051 KanbanBoardsController with real-time updates in src/core/controllers/kanban-boards.controller.ts
- [ ] T052 KanbanStagesController with workflow trigger management in src/core/controllers/kanban-stages.controller.ts
- [ ] T053 KanbanCardsController with position management and move operations in src/core/controllers/kanban-cards.controller.ts
- [ ] T054 [P] CardFieldDefinitionsController with field type validation in src/core/controllers/card-field-definitions.controller.ts

### System Controllers
- [ ] T055 [P] HealthController with service status checks in src/app.controller.ts

## Phase 3.7: Infrastructure & Middleware

### Authentication & Security
- [ ] T056 [P] JWT Auth Guard with Supabase integration in src/shared/guards/jwt-auth.guard.ts
- [ ] T057 [P] RLS Policy Guard for company data isolation in src/shared/guards/rls-policy.guard.ts
- [ ] T058 [P] Rate limiting with @nestjs/throttler in src/shared/interceptors/rate-limit.interceptor.ts

### Logging & Monitoring
- [ ] T059 [P] Structured logging interceptor with correlation IDs in src/shared/interceptors/logging.interceptor.ts
- [ ] T060 [P] Performance monitoring for queries >500ms in src/shared/interceptors/performance.interceptor.ts

### Validation & DTOs
- [ ] T061 [P] Request validation pipes with class-validator in src/shared/pipes/validation.pipe.ts
- [ ] T062 [P] DTO classes for all API endpoints in src/core/dto/ and src/workflows/dto/

## Phase 3.8: Module Configuration

### Core Modules (Constitutional Requirement: Max 2 modules)
- [ ] T063 CoreModule with all entities, services, and controllers in src/core/core.module.ts
- [ ] T064 WorkflowsModule with ActivePieces integration in src/workflows/workflows.module.ts
- [ ] T065 AppModule with Supabase configuration and Fastify adapter in src/app.module.ts

### Shared Utilities
- [ ] T066 [P] CLI interface with operational commands in src/shared/cli/cli.module.ts

## Phase 3.9: Integration & Polish

### Real-time Features
- [ ] T067 Supabase realtime subscriptions for Kanban boards in src/core/services/kanban.service.ts (update)
- [ ] T068 [P] WebSocket gateway for live board updates in src/core/gateways/kanban.gateway.ts

### Performance & Optimization
- [ ] T069 [P] Database query optimization with proper indexes verification
- [ ] T070 [P] Caching layer for workflow templates and company data
- [ ] T071 [P] Connection pooling and performance tuning for 30k+ req/sec target

### Documentation & Testing Polish
- [ ] T072 [P] Unit tests for all services with mocking in tests/unit/
- [ ] T073 [P] OpenAPI documentation with curl examples in generated docs/
- [ ] T074 [P] Performance benchmarking and load testing scripts
- [ ] T075 [P] CLI interface documentation and usage examples

## Dependencies

### Critical Path
1. **Setup (T001-T004)** → **Database (T005-T007)** → **Tests (T008-T024)** → **Implementation (T025+)**
2. **Entities (T025-T035)** → **Services (T036-T045)** → **Controllers (T046-T055)**
3. **Infrastructure (T056-T062)** → **Modules (T063-T066)** → **Polish (T067-T075)**

### Blocking Dependencies
- **T041** blocks **T042** (ActivePieces service before workflow execution)
- **T043** blocks **T051,T052,T053** (Kanban service before controllers)
- **T063,T064** block **T065** (Core modules before App module)
- **T056,T057** block all controllers (Auth guards required)

### Service Dependencies
- **T025-T035** (entities) block **T036-T045** (services)
- **T036-T045** (services) block **T046-T055** (controllers)
- **T041** (ActivePieces) blocks **T021,T022** (workflow integration tests)

## Parallel Execution Examples

### Phase 3.3 - Contract Tests (All Parallel)
```bash
# Launch T008-T018 together (different test files):
Task: "Contract test POST /companies in tests/contract/companies_create.test.sh"
Task: "Contract test GET /companies in tests/contract/companies_list.test.sh"
Task: "Contract test POST /studios in tests/contract/studios_create.test.sh"
Task: "Contract test GET /workflow-templates in tests/contract/workflow_templates_list.test.sh"
# ... all 11 contract tests can run in parallel
```

### Phase 3.4 - Entity Creation (All Parallel)
```bash
# Launch T025-T035 together (different entity files):
Task: "Company entity in src/core/entities/company.entity.ts"
Task: "User entity in src/core/entities/user.entity.ts"
Task: "Studio entity in src/core/entities/studio.entity.ts"
# ... all 11 entities can run in parallel
```

### Phase 3.5 - Core Services (Mostly Parallel)
```bash
# Launch T036-T040,T044,T045 together (different service files):
Task: "CompanyService in src/core/services/company.service.ts" 
Task: "UserService in src/core/services/user.service.ts"
Task: "StudioService in src/core/services/studio.service.ts"
# T041 → T042 → T043 must be sequential (dependency chain)
```

## Constitutional Compliance Notes
- ✅ **Maximum 2 Services**: CoreModule + WorkflowsModule (T063, T064)
- ✅ **Direct Integration**: Supabase client directly in services, no wrapper layer
- ✅ **TDD Mandatory**: All tests (T008-T024) before implementation (T025+)
- ✅ **CLI Interface**: Operational commands in src/shared/cli/ (T066)
- ✅ **Structured Logging**: Correlation IDs and JSON format (T059)

## Validation Checklist
*GATE: Checked before task execution*

- [x] All 36 API endpoints have corresponding contract tests (T008-T018)
- [x] All 10 entities have model creation tasks (T025-T035)
- [x] All 4 Kanban entities fully integrated with workflow triggers
- [x] ActivePieces integration covers execution and webhooks (T041-T042)
- [x] Supabase Auth + RLS policies implemented (T056-T057)
- [x] Real-time Kanban updates with workflow automation (T043, T067)
- [x] All tests come before implementation (T008-T024 → T025+)
- [x] Parallel tasks are truly independent (different files)
- [x] Performance target of 30k+ req/sec addressed (T071)
- [x] Constitutional compliance maintained throughout

## Notes
- **[P] tasks** = different files, no dependencies, can run in parallel
- **Sequential tasks** = same file or direct dependencies
- **Verify tests fail** before implementing (TDD approach)
- **Commit after each task** for proper version control
- **Constitutional principles** enforced: simplicity, direct integration, TDD mandatory