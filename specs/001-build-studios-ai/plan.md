
# Implementation Plan: Studios AI Backend Platform

**Branch**: `001-build-studios-ai` | **Date**: 2025-10-04 | **Spec**: [specs/001-build-studios-ai/spec.md](./spec.md)
**Input**: Feature specification from `/Users/peralles/Downloads/github/aikaa-ai-studios/specs/001-build-studios-ai/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code, or `AGENTS.md` for all other agents).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Studios AI Backend Platform: A comprehensive backend platform that enables businesses to create and manage AI-powered automation studios. Users can register companies (with headquarters and branches), create multiple studios per company, and execute pre-built automation workflows through ActivePieces integration with NestJS and Supabase full-stack architecture.

## Technical Context
**Language/Version**: Node.js 18+ with TypeScript 5.0+  
**Primary Dependencies**: NestJS, Supabase (PostgreSQL/Auth/Storage), ActivePieces REST API, Fastify adapter  
**Storage**: Supabase PostgreSQL with Row Level Security, Supabase Storage for files  
**Testing**: Jest unit testing, Supertest integration testing with real database, curl endpoint testing  
**Target Platform**: Backend API-first platform (Linux server deployment)  
**Project Type**: Backend-only (single API service architecture)  
**Performance Goals**: 30,000+ requests/second with Fastify adapter, real-time workflow execution monitoring  
**Constraints**: Maximum 3 services architecture, direct framework integration without abstractions, TDD mandatory  
**Scale/Scope**: Multi-tenant with company-based data isolation, workflow orchestration at scale

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Three Services Maximum**: ✅ PASS - Single NestJS backend service with two modules (Core Platform API, Workflow Execution Engine)  
**Direct Technology Integration**: ✅ PASS - Direct NestJS + Supabase integration without wrapper layers  
**ActivePieces Integration**: ✅ PASS - Standard REST API calls to ActivePieces endpoints without intermediary services  
**Test-First Development**: ✅ PASS - TDD mandatory with curl endpoint testing and real database integration tests  
**CLI Interface**: ✅ PASS - CLI interface required for observability and operational tasks  
**Supabase Security**: ✅ PASS - Supabase Auth with JWT, RLS policies, rate limiting via @nestjs/throttler  
**Structured Logging**: ✅ PASS - NestJS structured logging with ActivePieces workflow tracking

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md                    # This file (/plan command output)
├── research.md                # Phase 0 output (/plan command)
├── data-model.md              # Phase 1 output (/plan command)
├── quickstart.md              # Phase 1 output (/plan command)
├── implementation-sequence.md # Phase 1 output (/plan command) - Step-by-step guide
├── contracts/                 # Phase 1 output (/plan command)
└── tasks.md                   # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── main.ts                     # NestJS bootstrap with Fastify adapter
├── app.module.ts              # Root module with Supabase configuration
├── core/                      # Core Platform API (entities, analytics, user management)
│   ├── core.module.ts
│   ├── entities/              # Company, Studio, User, File, Analytics entities
│   ├── services/              # Business logic services + analytics
│   ├── controllers/           # REST API endpoints + analytics endpoints
│   └── dto/                   # Data transfer objects
├── workflows/                 # Workflow Execution Engine
│   ├── workflows.module.ts
│   ├── services/              # ActivePieces integration + execution logic
│   ├── controllers/           # Workflow execution endpoints
│   └── dto/
├── shared/                    # Shared utilities (NOT a service)
│   ├── guards/                # JWT auth guards
│   ├── pipes/                 # Validation pipes
│   ├── interceptors/          # Logging interceptors
│   └── cli/                   # CLI interface
└── supabase/                  # Database migrations and RLS policies

tests/
├── contract/                  # API contract tests (curl-based)
├── integration/               # End-to-end with real database
└── unit/                      # Service unit tests

package.json                   # NestJS dependencies
nest-cli.json                  # NestJS configuration
tsconfig.json                  # TypeScript configuration
```

**Structure Decision**: Single NestJS backend service with exactly two modules as per constitutional requirements: Core Platform API (entities, analytics, user management) and Workflow Execution Engine (ActivePieces integration). File Management is integrated into Core Platform API via Supabase Storage. Direct Supabase integration without additional service layers.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy** (SIMPLIFIED per constitution):
- Load `.specify/templates/tasks-template.md` as base
- **Constitutional Focus**: Maximum simplicity, direct integration, TDD approach
- **From contracts/api.yaml**: Generate simple contract tests for core endpoints only
- **From data-model.md**: Simplified entities (6 core tables + 1 view, no junction tables)
- **From quickstart.md**: Single contract test script (lines 221-250)

**Specific Task Categories** (SIMPLIFIED):
1. **Infrastructure Setup** (4 tasks):
   - NestJS + Supabase basic setup
   - Database schema with simplified tables
   - Core modules (2 modules only: Core + Workflows)
   - Basic contract test

2. **Core Implementation** (6 tasks):
   - Entity services with direct Supabase integration
   - Controllers with OpenAPI validation
   - ActivePieces integration service
   - File management via Supabase Storage
   - Authentication guards
   - Real-time analytics via database views

3. **Integration Testing** (2 tasks):
   - End-to-end user scenarios
   - Performance validation

**Ordering Strategy** (CONSTITUTIONAL COMPLIANCE):
- **Phase A**: Infrastructure (tasks 1-4) - Sequential, TDD approach
- **Phase B**: Core Implementation (tasks 5-10) - Limited parallelism
- **Phase C**: Integration Testing (tasks 11-12) - Sequential validation

**Constitutional Simplifications Applied**:
- Removed analytics module (merged into Core)
- Removed junction tables (use JSON arrays)
- Removed complex branch hierarchy (JSON in Company)
- Simplified contract testing (single script)
- Direct Supabase integration (no abstractions)

**Estimated Output**: 12 numbered, ordered tasks focused on constitutional compliance

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS (simplified to 2 modules, removed over-engineering)
- [x] Constitutional Compliance Review: PASS (removed junction tables, simplified testing, direct integration)
- [x] All NEEDS CLARIFICATION resolved (Technical Context complete)
- [x] Complexity deviations documented (None - fully constitutional compliant design)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
