# Implementation Sequence Guide: Studios AI Backend Platform

**Feature**: Studios AI Backend Platform  
**Date**: 2025-10-04  
**Purpose**: Step-by-step implementation guide with file references

## Phase-by-Phase Implementation Sequence
**Task 21**: Contract Test Suite
**File References**:
- `contracts/api.yaml` → Complete OpenAPI specification with all endpoints
- `quickstart.md` section "Contract Test Examples" → Curl commands for each endpoint
- `quickstart.md` section "Test Data Management" → Setup and cleanup procedures

**Implementation Steps**:
1. **Create Test Files for Each Endpoint Group**:
   - tests/contract/companies.test.sh (POST /companies, GET /companies)
   - tests/contract/studios.test.sh (Studio CRUD operations)
   - tests/contract/kanban.test.sh (Board/Stage/Card operations)
   - tests/contract/workflows.test.sh (Template discovery and execution)

2. **Copy Curl Commands** from quickstart.md:
   - Use exact curl syntax from "Contract Test Examples" section
   - Include proper JSON payloads and headers
   - Add expected HTTP status codes

3. **Test Data Management**:
   - Create setup-test-data.sql for consistent test data
   - Add cleanup procedures after each test run
   - Use Supabase test utilities for isolation

4. **Master Test Runner** (tests/run-all-contracts.sh):
   ```bash
   #!/bin/bash
   ./setup-test-data.sh
   ./companies.test.sh && ./studios.test.sh && ./kanban.test.sh && ./workflows.test.sh
   ./cleanup-test-data.sh
   ```

**Success Criteria**: All endpoint groups tested, proper HTTP status codes, comprehensive coverage A: Infrastructure Setup (Tasks 1-4) - SIMPLIFIED
**Dependencies**: None  
**Parallel Execution**: ❌ Sequential required  
**Estimated Time**: 1-2 hours

#### Task 1: Basic NestJS + Supabase Setup
**File References**: 
- `research.md` section "Configuration Examples" → Environment Variables
- `plan.md` section "Project Structure" → Source Code structure
- `quickstart.md` section "Environment Setup" → Database Commands

**Implementation Steps**:
1. **Initialize NestJS Project**:
   ```bash
   nest new studios-ai-backend --package-manager npm
   cd studios-ai-backend
   ```

2. **Install Dependencies** (from research.md "Dependency Stack"):
   ```bash
   npm install @nestjs/platform-fastify @supabase/supabase-js @nestjs/throttler class-validator class-transformer @nestjs/swagger
   npm install -D @types/node typescript
   ```

3. **Initialize Supabase**:
   ```bash
   supabase init
   supabase start
   ```

4. **Create Environment Configuration** (copy from research.md lines 230-250):
   - Create `.env` file with Supabase credentials from `supabase status`
   - Copy exact environment variables template from research.md
   - Verify connection with `supabase status`

**Success Criteria**: `npm run start:dev` runs without errors, Supabase shows "healthy" status

#### Task 2: Database Schema + Migrations
**File References**: 
- `data-model.md` section "Database Schema & Migrations" → Complete SQL Schema
- `data-model.md` section "Row Level Security Policies" → RLS implementation
- `plan.md` section "Project Structure" → supabase/ folder structure

**Implementation Steps**:
1. **Create Migration File**:
   ```bash
   supabase migration new create_studios_ai_schema
   ```

2. **Copy Complete Schema** (from data-model.md "Core Tables SQL Schema"):
   - Copy entire SQL block starting with `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
   - Include all 10 tables: companies, user_profiles, user_companies, studios, workflow_templates, workflow_executions, files, kanban_boards, kanban_stages, kanban_cards, card_field_definitions
   - Include analytics view: `CREATE VIEW studio_analytics AS...`

3. **Add RLS Policies** (from data-model.md "Row Level Security Policies"):
   - Copy all `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` statements
   - Copy all `CREATE POLICY` statements for each table

4. **Apply Migration**:
   ```bash
   supabase db push
   supabase db reset  # if needed for clean slate
   ```

**Success Criteria**: `supabase db push` succeeds, all 10 tables + 1 view exist, RLS policies active

#### Task 3: Core Modules Setup
**File References**: 
- `plan.md` section "Project Structure" → Source Code structure (src/ folder)
- `research.md` section "Configuration Examples" → NestJS Configuration Files
- `plan.md` section "Constitution Check" → Two modules maximum

**Implementation Steps**:
1. **Configure Fastify Adapter** (src/main.ts):
   ```typescript
   import { NestFactory } from '@nestjs/core'
   import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
   import { AppModule } from './app.module'
   
   async function bootstrap() {
     const app = await NestFactory.create<NestFastifyApplication>(
       AppModule,
       new FastifyAdapter({ logger: true })
     )
     await app.listen(3000, '0.0.0.0')
   }
   bootstrap()
   ```

2. **Setup Supabase Client** (src/app.module.ts):
   - Copy configuration from research.md "NestJS Configuration Files"
   - Import @supabase/supabase-js
   - Create SupabaseService provider

3. **Create Two Core Modules** (constitutional requirement):
   ```bash
   mkdir -p src/core src/workflows
   nest generate module core
   nest generate module workflows
   ```

4. **Basic Folder Structure**:
   ```
   src/
   ├── core/           # Core Platform API
   ├── workflows/      # Workflow Execution Engine  
   ├── shared/         # Utilities (NOT a service)
   └── supabase/       # Database migrations
   ```

**Success Criteria**: App starts with Fastify, Supabase connection established, two modules created

#### Task 4: Basic Contract Test
**File References**: 
- `contracts/api.yaml` → /health endpoint definition
- `quickstart.md` section "Contract Test Examples" → curl commands
- `quickstart.md` section "TDD Workflow" → test-first approach

**Implementation Steps**:
1. **Create Test Script** (tests/contract/test-contracts.sh):
   ```bash
   #!/bin/bash
   # Basic health check (no auth required)
   curl -f http://localhost:3000/v1/health || exit 1
   echo "✅ Health endpoint working"
   
   # This will fail initially (TDD approach)
   curl -X POST http://localhost:3000/v1/companies \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Company","industry_type":"technology","contact_email":"test@example.com","headquarters_address":"123 Test St"}' \
     || echo "❌ Company creation not implemented yet (expected)"
   ```

2. **Implement Basic Health Endpoint** (src/app.controller.ts):
   ```typescript
   @Get('health')
   health() {
     return { status: 'healthy', timestamp: new Date().toISOString() }
   }
   ```

3. **Run Contract Test**:
   ```bash
   chmod +x tests/contract/test-contracts.sh
   npm run start:dev &
   ./tests/contract/test-contracts.sh
   ```

**Success Criteria**: Health endpoint returns 200, company endpoint returns 404/500 (not implemented yet)

### Phase B: Core Implementation (Tasks 5-10) - SIMPLIFIED
**Dependencies**: Phase A complete  
**Parallel Execution**: ⚠️ Limited parallelism  
**Estimated Time**: 3-4 hours

#### Tasks 8-20: Entity Creation (Parallel)
**File References**: `data-model.md` lines 8-250 for each entity

**Task 8**: Company Entity
**File References**:
- `data-model.md` section "Company" → Entity definition with TypeScript interface
- `data-model.md` section "Validation Rules" → Field constraints and business rules
- `contracts/api.yaml` → Company schema definition

**Implementation Steps**:
1. Create src/core/entities/company.entity.ts
2. Copy Company interface from data-model.md "Company" section
3. Add validation decorators (class-validator): @IsEmail, @Length(3,100), @IsEnum
4. Implement validation rules: name uniqueness, email format, address minimum length
5. Add Supabase table mapping with proper column names

**Success Criteria**: TypeScript compiles, validation decorators applied, matches database schema

**Task 9**: CompanyBranch Entity  
- Reference: data-model.md lines 44-65
- Create src/core/entities/company-branch.entity.ts

**Task 10**: User Entity
- Reference: data-model.md lines 67-85
- Create src/core/entities/user.entity.ts
- Extend Supabase auth.users

**Task 11**: UserCompany Junction
- Reference: data-model.md lines 87-120
- Create src/core/entities/user-company.entity.ts
- Implement state transition logic lines 121-125

**Task 12**: Studio Entity
- Reference: data-model.md lines 127-155
- Create src/core/entities/studio.entity.ts

**Task 13**: WorkflowTemplate Entity
- Reference: data-model.md lines 157-195
- Create src/core/entities/workflow-template.entity.ts

**Task 14**: WorkflowExecution Entity
- Reference: data-model.md lines 197-240
- Create src/core/entities/workflow-execution.entity.ts
- Implement status state machine lines 268-275

**Task 15**: File Entity
- Reference: data-model.md lines 242-275
- Create src/core/entities/file.entity.ts

**Task 16**: Analytics Entity
- Reference: data-model.md lines 290-320
- Create src/analytics/entities/studio-analytics.entity.ts

#### Tasks 17-20: Kanban Entities (Parallel)
**File References**: `data-model.md` lines 320-400 for Kanban entities

**Task 17**: KanbanBoard Entity
- Reference: data-model.md lines 325-350
- Create src/core/entities/kanban-board.entity.ts
- Implement validation rules for board creation

**Task 18**: KanbanStage Entity  
- Reference: data-model.md lines 352-385
- Create src/core/entities/kanban-stage.entity.ts
- Implement workflow trigger configuration

**Task 19**: KanbanCard Entity
- Reference: data-model.md lines 387-425
- Create src/core/entities/kanban-card.entity.ts
- Implement custom fields and position management

**Task 20**: CardFieldDefinition Entity
- Reference: data-model.md lines 427-470
- Create src/core/entities/card-field-definition.entity.ts
- Implement field type configurations

#### Task 21: Contract Test Suite
**File References**:
- `contracts/api.yaml` (complete OpenAPI spec)
- `quickstart.md` lines 220-340 (contract test examples)

**Implementation Steps**:
1. Create contract test files from quickstart.md examples
2. Set up test runner script (quickstart.md lines 341-355)
3. Implement test data setup/cleanup utilities
4. Verify all endpoints return proper HTTP status codes

### Phase C: Service Implementations (Tasks 22-32)
**Dependencies**: Phase A + B complete  
**Parallel Execution**: ⚠️ Limited parallel - respect service dependencies  
**Estimated Time**: 6-8 hours

#### Task 22: Core Services (Sequential)
**File References**:
- `contracts/api.yaml` paths section (lines 451-750)
- `research.md` lines 108-125 (Supabase integration pattern)

**Sub-tasks**:
- CompanyService: Implement CRUD with RLS
- StudioService: Company-scoped operations
- UserService: Profile management and company relationships

#### Task 23: Workflow Template Service
**File References**:
- `contracts/api.yaml` lines 550-600 (/workflow-templates endpoints)
- `research.md` lines 45-65 (ActivePieces integration)

**Implementation Steps**:
1. Create WorkflowTemplateService
2. Implement template discovery with filtering
3. Add search functionality with full-text search
4. Cache frequently accessed templates

#### Task 24: ActivePieces Integration Service
**File References**:
- `research.md` section "Workflow Integration" → ActivePieces REST API decision and rationale
- `research.md` section "Configuration Examples" → ActivePieces Configuration
- `contracts/api.yaml` → WorkflowExecution endpoints that trigger ActivePieces calls

**Implementation Steps**:
1. **Create ActivePieces Service** (src/workflows/services/activepieces.service.ts):
   ```typescript
   @Injectable()
   export class ActivePiecesService {
     private httpClient = axios.create({
       baseURL: process.env.ACTIVEPIECES_API_URL,
       headers: { 'Authorization': `Bearer ${process.env.ACTIVEPIECES_API_KEY}` }
     })
   }
   ```

2. **Implement Flow Execution** (based on research.md "Workflow Integration"):
   - POST /v1/flows/{flowId}/runs endpoint
   - Include input data payload
   - Return execution ID for tracking

3. **Status Polling Implementation**:
   - GET /v1/flow-runs/{runId} endpoint  
   - Map ActivePieces status to WorkflowExecution status
   - Handle completion, failure, and timeout states

4. **Retry Strategy** (exponential backoff pattern):
   - Retry transient failures (5xx, network timeouts)
   - Maximum 3 retry attempts (per data-model.md WorkflowExecution.retry_count)
   - Exponential backoff: 1s → 2s → 4s intervals

5. **Webhook Handlers** for async callbacks:
   - POST /webhooks/activepieces endpoint
   - Verify webhook signatures with ACTIVEPIECES_WEBHOOK_SECRET
   - Update WorkflowExecution status in database

**Success Criteria**: Can execute flows, poll status, handle webhooks, retry failures

#### Task 25: Workflow Execution Service
**File References**:
- `contracts/api.yaml` lines 601-700 (workflow execution endpoints)
- `data-model.md` lines 268-275 (state transitions)

**Implementation Steps**:
1. Create WorkflowExecutionService
2. Implement execution orchestration
3. Add status monitoring and updates
4. Implement pause/resume/cancel operations
5. Set up automatic retry for failed executions

#### Task 26: File Management Service
**File References**:
- `contracts/api.yaml` lines 701-800 (file management endpoints)
- `research.md` lines 25-35 (Supabase Storage)

**Implementation Steps**:
1. Create FileService with Supabase Storage integration
2. Implement multipart file upload handling
3. Add file type validation and size limits
4. Implement secure download URLs with expiration
5. Set up access control based on studio membership

#### Task 27: Kanban Management Service
**File References**:
- `contracts/api.yaml` → Kanban Management tag with all board/stage/card endpoints
- `data-model.md` section "Kanban Entities" → KanbanBoard, KanbanStage, KanbanCard, CardFieldDefinition
- `spec.md` → FR-021 through FR-027 (Kanban functional requirements)

**Implementation Steps**:
1. **Create KanbanService** (src/core/services/kanban.service.ts):
   - Board CRUD operations with studio-scoped access control
   - Stage management with position ordering and workflow triggers
   - Card operations with custom fields and assignee management

2. **Real-time Updates** (Supabase Realtime integration):
   ```typescript
   // Subscribe to card changes for live board updates
   supabase.channel('kanban_cards')
     .on('postgres_changes', { event: '*', schema: 'public', table: 'kanban_cards' }, payload => {
       this.broadcastCardUpdate(payload)
     })
   ```

3. **Workflow Trigger System**:
   - Evaluate TriggerCondition array when cards move stages
   - Check combined conditions (stage + attribute changes)
   - Call ActivePiecesService.executeFlow() when triggers match
   - Use WorkflowTriggerConfig from KanbanStage.workflow_triggers

4. **Card Position Management**:
   - Handle drag-drop position updates within stages  
   - Prevent position conflicts with atomic updates
   - Reorder other cards when positions change

5. **Custom Field Validation**:
   - Validate CardCustomField values against CardFieldDefinition
   - Check field types: text, number, date, dropdown, checkbox
   - Enforce required fields and field-specific constraints

6. **ActivePieces Event Integration**:
   - Trigger workflows on stage transitions (stage_entry/stage_exit)
   - Trigger workflows on attribute changes (attribute_change)
   - Pass card data and change context to ActivePieces

**Success Criteria**: Board operations work, real-time updates active, workflow triggers firing

#### Task 28: Analytics Service
**File References**:
- `data-model.md` lines 290-320 (StudioAnalytics entity)
- Feature spec FR-012, FR-013 (analytics requirements)

**Implementation Steps**:
1. Create AnalyticsService for usage tracking
2. Implement daily aggregation jobs
3. Create business metrics calculation
4. Add real-time analytics endpoints

#### Task 29: Controllers Implementation
**File References**:
- `contracts/api.yaml` complete paths section
- `quickstart.md` lines 42-100 (curl testing examples)

**Implementation Steps**:
1. Create controllers for each service
2. Implement OpenAPI decorators from contracts
3. Add request/response DTOs with validation
4. Set up proper HTTP status codes and error handling

#### Task 30: Authentication and Authorization
**File References**:
- `research.md` lines 130-150 (auth flow)
- `data-model.md` lines 381-410 (RLS policies)

**Implementation Steps**:
1. Implement company-based access control
2. Add user role checking (admin/member)
3. Set up studio access permissions
4. Test with different user scenarios

### Phase D: Integration Testing (Tasks 31-36)
**Dependencies**: Phase C complete  
**Parallel Execution**: ❌ Sequential integration scenarios  
**Estimated Time**: 3-4 hours

#### Task 31-36: User Story Integration Tests
**File References**: `quickstart.md` lines 270-300 (user story validation)

**Task 31**: Business Registration Flow
- Reference: Feature spec acceptance scenario 1
- Test complete company creation to first studio

**Task 32**: Multi-Studio Management  
- Reference: Feature spec acceptance scenario 2
- Test studio creation and team access

**Task 33**: Kanban-Driven Workflow Automation
- Reference: Feature spec acceptance scenarios 3-4 (updated with Kanban)
- Test complete Kanban board creation with custom stages
- Test card creation with custom fields and workflow triggers
- Test stage transition triggering ActivePieces workflows
- Test attribute change triggering combined conditions

**Task 34**: Workflow Execution Flow
- Reference: Feature spec acceptance scenarios 3-4
- Test end-to-end workflow execution with ActivePieces

**Task 35**: File Upload and Processing
- Reference: Feature spec file handling requirements
- Test file upload, access control, and workflow integration

**Task 36**: Analytics and Monitoring
- Reference: Feature spec acceptance scenario 5
- Test analytics generation and real-time monitoring

## Implementation Checkpoints

### Checkpoint 1: After Phase A (Infrastructure)
**Verification Steps**:
1. Run `npm run start:dev` - should start without errors
2. Verify database connection: `supabase status`
3. Check health endpoint: `curl http://localhost:3000/v1/health`
4. Verify CLI works: `npm run cli health`

### Checkpoint 2: After Phase B (Models + Contracts)
**Verification Steps**:
1. Run contract tests: `./tests/run-contract-tests.sh`
2. Verify all entities compile without TypeScript errors
3. Check database schema matches entities
4. Confirm all OpenAPI endpoints return proper error codes

### Checkpoint 3: After Phase C (Services)
**Verification Steps**:
1. Run full integration test suite
2. Verify ActivePieces integration with mock workflows
3. Test file upload/download functionality
4. Confirm all CRUD operations work with RLS
5. Performance test: verify 1000+ req/sec baseline

### Checkpoint 4: After Phase D (Complete)
**Verification Steps**:
1. Execute all user story scenarios from quickstart.md
2. Run load testing: 10k+ requests with concurrent users
3. Verify analytics data generation
4. Test error scenarios and recovery
5. Confirm production readiness checklist

## Cross-Reference Quick Guide

### 🔍 **Find Specific Implementation Details**

**Entity Definitions & Validation**:
- Company Entity → `data-model.md` section "Company" 
- User & Auth → `data-model.md` section "User" + "UserCompany"
- Studios → `data-model.md` section "Studio"
- Workflows → `data-model.md` section "WorkflowTemplate" + "WorkflowExecution"
- Files → `data-model.md` section "File"
- Kanban System → `data-model.md` section "Kanban Entities"

**API Contracts & Endpoints**:
- All Endpoints → `contracts/api.yaml` paths section
- Request/Response Schemas → `contracts/api.yaml` components.schemas
- Authentication → `contracts/api.yaml` security section
- Kanban APIs → `contracts/api.yaml` tag "Kanban Management"

**Configuration & Setup**:
- Environment Variables → `research.md` section "Configuration Examples"
- NestJS Config → `research.md` section "NestJS Configuration Files"
- Database Schema → `data-model.md` section "Database Schema & Migrations"
- RLS Policies → `data-model.md` section "Row Level Security Policies"

**Testing & Validation**:
- Contract Tests → `quickstart.md` section "Contract Test Examples"
- TDD Workflow → `quickstart.md` section "TDD Workflow"
- Integration Tests → `quickstart.md` section "Integration Testing"
- User Story Validation → `spec.md` section "Acceptance Scenarios"

**Integration Patterns**:
- ActivePieces → `research.md` section "Workflow Integration"
- Supabase Auth → `research.md` section "Authentication & Authorization"
- Real-time Updates → `research.md` section "Database Integration"
- File Storage → `research.md` section "Storage Integration"

### 🎯 **Implementation Decision Tree**

**Starting a Task?**
1. Check task's "File References" section for exact locations
2. Read referenced sections for business context
3. Copy code examples and adapt to your specific entity/endpoint
4. Run contract tests to verify implementation

**Need Code Examples?**
- TypeScript Interfaces → `data-model.md` entity sections
- API Endpoints → `contracts/api.yaml` paths
- Configuration → `research.md` "Configuration Examples"
- Test Scripts → `quickstart.md` "Contract Test Examples"

**Debugging Implementation?**
- Check constitutional compliance → `plan.md` "Constitution Check"
- Verify database schema → `data-model.md` SQL sections
- Test with curl → `quickstart.md` test examples
- Review requirements → `spec.md` functional requirements

### ⚡ **Quick Commands Reference**

```bash
# Development
npm run start:dev          # Start with hot reload
npm run test:watch         # TDD mode

# Database  
supabase db push          # Apply migrations
supabase db reset         # Clean slate

# Testing
./tests/contract/test-contracts.sh    # Contract tests
npm run test:e2e                      # Integration tests
```  

---

**Implementation Guide Status**: ✅ Complete (CONSTITUTIONALLY COMPLIANT)  
**Total Estimated Time**: 12-16 hours (with Kanban integration)  
**Critical Path**: Phase A → Phase B → Phase C → Phase D  
**Constitutional Compliance**: Maximum simplicity, direct integration, 2 modules only  
**Kanban Integration**: Full event-driven workflow automation with real-time updates  
**Parallel Opportunities**: Limited per constitutional TDD requirements