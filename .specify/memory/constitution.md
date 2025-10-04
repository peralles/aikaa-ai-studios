<!--
Sync Impact Report:
- Version change: initial → 1.0.0
- Added principles: 
  * I. Maximum Three Services Architecture
  * II. Direct Technology Integration 
  * III. Test-First Development (NON-NEGOTIABLE)
  * IV. CLI Interface Requirement
  * V. Security Through Platform
- Added sections:
  * Technology Stack Requirements
  * Performance and Monitoring Standards
- Templates requiring updates:
  ✅ plan-template.md - Constitution Check section updated
  ✅ spec-template.md - aligned with security and testing requirements
  ✅ tasks-template.md - updated to reflect TDD and CLI requirements
- Follow-up TODOs: None
-->

# Studios AI Backend Platform Constitution

## Core Principles

### I. Maximum Three Services Architecture
The platform MUST maintain a maximum of three services to ensure simplicity and 
reduce operational complexity. Each service MUST have a clear, distinct responsibility:
Core Platform API, Workflow Execution Engine, and File Management Service. Any proposal 
for additional services requires explicit architectural justification demonstrating that 
the functionality cannot be achieved within existing service boundaries.

### II. Direct Technology Integration
All services MUST use NestJS with Supabase directly without unnecessary abstractions 
or wrapper layers. ActivePieces workflows MUST be integrated via their standard REST API 
without custom intermediary services. Database access MUST use Supabase client libraries 
directly, avoiding ORM layers or custom data access abstractions that do not provide 
measurable performance or maintainability benefits.

### III. Test-First Development (NON-NEGOTIABLE)  
TDD is mandatory for all development: Tests MUST be written and approved before implementation.
All endpoints MUST be testable via simple curl commands with clear expected responses.
Integration tests MUST use real databases, not mocks, to validate actual data persistence 
and retrieval. The Red-Green-Refactor cycle is strictly enforced - no feature implementation 
without failing tests first.

### IV. CLI Interface Requirement
Every service MUST expose a CLI interface for observability, testing, and operational tasks.
CLI commands MUST follow text in/out protocol: configuration via arguments or stdin, 
results to stdout, errors to stderr. CLI interfaces MUST support both JSON output for 
automation and human-readable formats for manual operation. This ensures services remain 
debuggable and scriptable in production environments.

### V. Security Through Platform
Security MUST be implemented using Supabase built-in authentication and row-level security 
policies rather than custom authentication layers. All endpoints MUST implement rate limiting 
to prevent abuse. Input validation MUST occur at service boundaries using TypeScript types 
and validation decorators. All user data access MUST be governed by Supabase RLS policies 
that ensure users can only access their own organization's data.

## Technology Stack Requirements

**Framework**: NestJS with TypeScript for all backend services  
**Database**: Supabase PostgreSQL with row-level security policies  
**Workflow Integration**: ActivePieces via REST API calls  
**Authentication**: Supabase Auth with JWT tokens  
**File Storage**: Supabase Storage with secure access controls  
**Testing**: Jest for unit tests, Supertest for integration tests with real database  
**CLI Framework**: Commander.js for consistent CLI interfaces  
**Rate Limiting**: NestJS throttling middleware  
**Validation**: class-validator and class-transformer decorators

## Performance and Monitoring Standards

**Structured Logging**: All services MUST use structured JSON logging with correlation IDs 
for request tracing. Workflow execution logs MUST include start time, end time, success/failure 
status, and error details for debugging failed automations.

**Performance Monitoring**: All workflow executions MUST be monitored for duration and success 
rates. Database query performance MUST be logged for queries exceeding 500ms. API endpoints 
MUST log response times and implement health check endpoints for monitoring.

**Error Handling**: All services MUST implement graceful error handling with meaningful error 
messages. Workflow failures MUST be logged with sufficient detail for troubleshooting. 
Database connection failures MUST trigger appropriate retry logic with exponential backoff.

## Governance

This constitution supersedes all other development practices and architectural decisions. 
All feature specifications, implementation plans, and code reviews MUST verify compliance 
with these principles. Any deviation requires explicit justification documented in the 
Complexity Tracking section of implementation plans.

Amendments to this constitution require approval from project maintainers and MUST include 
a migration plan for existing code. All constitutional changes MUST be propagated to 
dependent templates and documentation within 48 hours of approval.

**Version**: 1.0.0 | **Ratified**: 2025-10-04 | **Last Amended**: 2025-10-04