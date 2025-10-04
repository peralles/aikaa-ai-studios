# Research: Studios AI Backend Platform

**Feature**: Studios AI Backend Platform  
**Date**: 2025-10-04  
**Phase**: 0 - Research & Technology Decisions

## Technology Stack Decisions

### Backend Framework
**Decision**: NestJS with TypeScript 5.0+  
**Rationale**: 
- Modular architecture with @Module decorators aligns with constitutional requirement for structured design
- Built-in dependency injection supports clean separation of concerns
- Excellent TypeScript support for type safety and validation
- Large ecosystem with extensive testing utilities
- Direct integration capabilities with Supabase client libraries

**Alternatives considered**: 
- Express.js (rejected: lacks structured architecture)
- Fastify (rejected: NestJS can use Fastify adapter for performance)
- Hapi.js (rejected: smaller ecosystem, less Supabase integration)

### Database & Auth Platform
**Decision**: Supabase (PostgreSQL + Auth + Storage)  
**Rationale**:
- Row Level Security (RLS) provides constitutional requirement for data isolation
- Built-in JWT authentication eliminates custom auth layers
- Auto-generated REST APIs reduce boilerplate code
- Real-time subscriptions for workflow monitoring
- Integrated file storage with access controls
- Connection pooling for performance

**Alternatives considered**:
- Firebase (rejected: less SQL flexibility, vendor lock-in)
- Raw PostgreSQL + custom auth (rejected: violates direct integration principle)
- MongoDB + custom solution (rejected: lacks RLS, more complex)

### Performance Adapter
**Decision**: Fastify adapter for NestJS  
**Rationale**:
- Achieves 30,000+ req/sec performance target
- Drop-in replacement for Express in NestJS
- Maintains NestJS ecosystem compatibility
- Schema-based validation aligns with TypeScript approach

**Alternatives considered**:
- Express (rejected: lower performance ceiling)
- Raw Fastify (rejected: loses NestJS architectural benefits)

### Workflow Integration
**Decision**: ActivePieces REST API direct integration  
**Rationale**:
- Constitutional requirement for direct integration without intermediary services
- Standard HTTP client approach (axios/node-fetch)
- Well-documented REST endpoints for flow execution and monitoring
- Webhook support for async callbacks
- Polling strategies for execution status

**Alternatives considered**:
- ActivePieces SDK (rejected: adds abstraction layer)
- Custom workflow engine (rejected: violates simplicity principle)
- Zapier API (rejected: different feature set)

### Testing Strategy
**Decision**: Jest + Supertest + Real Database Integration  
**Rationale**:
- Jest provides excellent TypeScript support and NestJS integration
- Supertest enables curl-equivalent HTTP testing
- Real database testing aligns with constitutional TDD requirements
- Supabase Test utilities for database setup/teardown
- Integration tests verify actual data persistence

**Alternatives considered**:
- Mocked database tests (rejected: constitutional requirement for real DB)
- Mocha/Chai (rejected: less NestJS ecosystem integration)
- Vitest (rejected: newer, less mature ecosystem)

### CLI Framework
**Decision**: Commander.js with structured output  
**Rationale**:
- Text in/out protocol: stdin for config, stdout for results, stderr for errors
- JSON output support for automation
- Human-readable formats for manual operation
- Excellent TypeScript support
- Industry standard for Node.js CLI tools

**Alternatives considered**:
- Yargs (rejected: more complex API)
- Custom CLI (rejected: reinventing established patterns)
- oclif (rejected: heavyweight for simple requirements)

## Integration Patterns

### Supabase Client Integration
**Pattern**: Direct client library usage in NestJS services
```typescript
// Direct integration without repository pattern
constructor(private supabase: SupabaseClient) {}

async getCompanies(userId: string) {
  return this.supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId); // RLS handles access control
}
```

### ActivePieces Integration
**Pattern**: HTTP client with retry logic and status polling
```typescript
// Direct REST API calls
POST /v1/flows/{id} - Trigger workflow execution
GET /v1/flow-runs/{id} - Check execution status
```

### Authentication Flow
**Pattern**: Supabase JWT with NestJS Guards
```typescript
// JWT validation in guards, RLS policies in database
@UseGuards(SupabaseAuthGuard)
@Get('studios')
async getStudios() {
  // RLS automatically filters by authenticated user's company
}
```

## Performance Considerations

### Connection Pooling
**Approach**: Supabase connection pooling with optimized pool sizes
- Connection limits based on deployment environment
- Pool monitoring for connection leaks
- Graceful degradation under high load

### ActivePieces Workflow Polling
**Strategy**: Exponential backoff with circuit breaker pattern
- Initial poll interval: 1 second
- Max poll interval: 30 seconds
- Circuit breaker after 5 consecutive failures
- Webhook callbacks preferred over polling when available

### Database Query Optimization
**Approach**: RLS-aware indexing and query patterns
- Compound indexes on RLS filtering columns
- Query performance logging for 500ms+ queries
- Prepared statements for repeated queries

## Security Implementation

### Row Level Security Policies
**Pattern**: Company-based data isolation
```sql
-- Example RLS policy
CREATE POLICY company_isolation ON studios
  FOR ALL USING (company_id IN (
    SELECT company_id FROM user_companies 
    WHERE user_id = auth.uid()
  ));
```

### Input Validation
**Pattern**: NestJS ValidationPipe with class-validator decorators
```typescript
// Type-safe validation at service boundaries
export class CreateStudioDto {
  @IsString()
  @MinLength(3)
  name: string;
  
  @IsUUID()
  companyId: string;
}
```

### Rate Limiting
**Pattern**: @nestjs/throttler with company-based limits
- Per-user limits for authentication endpoints
- Per-company limits for workflow execution
- Global rate limiting for resource protection

## Monitoring & Observability

### Structured Logging
**Format**: JSON with correlation IDs and workflow context
```typescript
// Log format with tracing
{
  "timestamp": "2025-10-04T10:30:00Z",
  "level": "info",
  "correlationId": "req-12345",
  "workflowId": "flow-67890",
  "message": "Workflow execution started",
  "context": { "companyId": "comp-123", "userId": "user-456" }
}
```

### Workflow Execution Tracking
**Metrics**: Execution time, success rate, failure reasons
- Start/end time logging for all workflow executions
- Success/failure status with error categorization
- Execution time percentiles (p50, p95, p99)
- ActivePieces API response time monitoring

### Health Checks
**Endpoints**: Database connectivity, ActivePieces API availability
- `/health` - Basic service health
- `/health/db` - Database connection status
- `/health/workflows` - ActivePieces API connectivity
- Structured response format for monitoring systems

## Development Workflow

### Test-First Development Process
1. Write failing integration test for new endpoint
2. Write failing unit tests for service logic
3. Implement minimum code to pass tests
4. Refactor while maintaining test coverage
5. Verify curl-based contract tests pass

### CLI Development Pattern
1. Each service module exposes CLI commands
2. CLI commands support both JSON and human-readable output
3. Configuration via command arguments or stdin
4. Results to stdout, errors to stderr
5. Exit codes follow POSIX conventions

## Configuration Examples

### Environment Variables (.env)
```bash
# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# ActivePieces Configuration  
ACTIVEPIECES_API_URL=https://cloud.activepieces.com
ACTIVEPIECES_API_KEY=ap_1234567890abcdef
ACTIVEPIECES_WEBHOOK_SECRET=webhook_secret_key

# Application Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
JWT_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# File Upload Limits
MAX_FILE_SIZE=104857600  # 100MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf,text/csv
```

### NestJS Configuration Files
```typescript
// src/config/database.config.ts
export const databaseConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
};

// src/config/activepieces.config.ts
export const activepiecesConfig = {
  apiUrl: process.env.ACTIVEPIECES_API_URL,
  apiKey: process.env.ACTIVEPIECES_API_KEY,
  webhookSecret: process.env.ACTIVEPIECES_WEBHOOK_SECRET,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};
```

### Package.json Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-fastify": "^10.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/config": "^3.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "axios": "^1.5.0",
    "commander": "^11.0.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/jest": "^29.5.0",
    "@types/supertest": "^2.0.12",
    "jest": "^29.5.0",
    "supertest": "^6.3.0",
    "supabase": "^1.100.0"
  }
}
```

### Dockerfile for Production
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/
COPY .env.production ./.env

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
```

---

**Research Status**: ✅ Complete  
**Key Decisions**: 7 technology choices documented  
**Integration Patterns**: 4 patterns defined  
**Configuration Examples**: Environment, dependencies, and deployment setup  
**Next Phase**: Design & Contracts (Phase 1)