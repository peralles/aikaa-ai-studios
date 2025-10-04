# Quickstart: Studios AI Backend Platform

**Feature**: Studios AI Backend Platform  
**Date**: 2025-10-04  
**Phase**: 1 - Testing & Validation Guide

## Prerequisites

### Development Environment
- Node.js 18+ with npm/yarn
- NestJS CLI: `npm install -g @nestjs/cli`
- Supabase CLI: `npm install -g supabase`
- ActivePieces account with API access
- PostgreSQL client (optional, for direct DB access)

### Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd studios-ai-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure Supabase URL, anon key, service role key
# Configure ActivePieces API URL and key
```

### Supabase Configuration
```bash
# Initialize Supabase project
supabase init

# Start local Supabase (includes PostgreSQL + Auth)
supabase start

# Apply database migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts
```

## Test-First Development Workflow

### 1. Contract Testing (curl-based)
Verify API endpoints match OpenAPI specification before implementation:

```bash
# Health check (no auth required)
curl -X GET http://localhost:3000/v1/health \
  -H "Content-Type: application/json"
# Expected: 200 OK with {"status": "healthy", ...}

# Company creation (requires auth)
curl -X POST http://localhost:3000/v1/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "name": "Test Company",
    "industry_type": "technology",
    "contact_email": "test@company.com",
    "headquarters_address": "123 Main St, City, State"
  }'
# Expected: 201 Created with company object

# Studio creation
curl -X POST http://localhost:3000/v1/companies/{companyId}/studios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "name": "Marketing Automation",
    "business_area": "marketing",
    "description": "Automated marketing workflows"
  }'
# Expected: 201 Created with studio object

# Workflow template browsing (no company context needed)
curl -X GET "http://localhost:3000/v1/workflow-templates?business_area=marketing&complexity_level=beginner" \
  -H "Authorization: Bearer <jwt-token>"
# Expected: 200 OK with paginated templates array

# Workflow execution
curl -X POST http://localhost:3000/v1/studios/{studioId}/executions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "template_id": "template-uuid",
    "input_data": {
      "campaign_name": "Q4 Launch",
      "target_audience": "enterprise"
    }
  }'
# Expected: 201 Created with execution object (status: "pending")

# Check execution status
curl -X GET http://localhost:3000/v1/executions/{executionId} \
  -H "Authorization: Bearer <jwt-token>"
# Expected: 200 OK with execution details including status

# File upload (multipart/form-data)
curl -X POST http://localhost:3000/v1/studios/{studioId}/files \
  -H "Authorization: Bearer <jwt-token>" \
  -F "file=@test-document.pdf" \
  -F "access_level=studio"
# Expected: 201 Created with file object
```

### 2. Integration Testing (Real Database)
Test complete user scenarios with actual data persistence:

```typescript
// tests/integration/user-workflow.spec.ts
describe('User Workflow Integration', () => {
  let app: INestApplication;
  let supabase: SupabaseClient;
  let userToken: string;

  beforeAll(async () => {
    // Set up test application with real Supabase connection
    app = await createTestApp();
    supabase = createSupabaseClient();
    
    // Create test user and get JWT token
    userToken = await createTestUser();
  });

  it('should complete full business user scenario', async () => {
    // 1. User registers company
    const company = await request(app.getHttpServer())
      .post('/v1/companies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Integration Test Co',
        industry_type: 'technology',
        contact_email: 'test@integration.com',
        headquarters_address: '456 Test Ave, Test City, TC'
      })
      .expect(201);

    // 2. User creates studio
    const studio = await request(app.getHttpServer())
      .post(`/v1/companies/${company.body.id}/studios`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Test Marketing Studio',
        business_area: 'marketing'
      })
      .expect(201);

    // 3. User browses workflow templates
    const templates = await request(app.getHttpServer())
      .get('/v1/workflow-templates?business_area=marketing')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(templates.body.data.length).toBeGreaterThan(0);

    // 4. User executes workflow
    const execution = await request(app.getHttpServer())
      .post(`/v1/studios/${studio.body.id}/executions`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        template_id: templates.body.data[0].id,
        input_data: { test: 'data' }
      })
      .expect(201);

    expect(execution.body.status).toBe('pending');

    // 5. Verify data persisted in database
    const dbExecution = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', execution.body.id)
      .single();

    expect(dbExecution.data).toBeTruthy();
    expect(dbExecution.data.user_id).toBe(userToken.sub);
  });
});
```

### 3. ActivePieces Integration Testing
Mock ActivePieces responses for controlled testing:

```typescript
// tests/integration/activepieces.spec.ts
describe('ActivePieces Integration', () => {
  let mockActivePieces: MockActivePieces;

  beforeEach(() => {
    mockActivePieces = createActivePiecesMock();
  });

  it('should handle successful workflow execution', async () => {
    // Mock ActivePieces flow execution
    mockActivePieces.mockFlowExecution('flow-123', {
      id: 'run-456',
      status: 'RUNNING',
      startTime: new Date().toISOString()
    });

    mockActivePieces.mockFlowRunStatus('run-456', {
      id: 'run-456',
      status: 'SUCCEEDED',
      output: { result: 'success' },
      endTime: new Date().toISOString()
    });

    // Execute workflow through API
    const execution = await executeWorkflow({
      templateId: 'template-123',
      inputData: { test: 'input' }
    });

    // Verify ActivePieces integration
    expect(mockActivePieces.getExecutionCalls()).toContain('flow-123');
    expect(execution.status).toBe('succeeded');
    expect(execution.output_data.result).toBe('success');
  });

  it('should handle workflow execution failures with retry', async () => {
    // Mock transient failure then success
    mockActivePieces.mockFlowExecutionFailure('flow-123', 'TEMPORARY_ERROR');
    mockActivePieces.mockFlowExecutionSuccess('flow-123', 'run-789');

    const execution = await executeWorkflowWithRetry({
      templateId: 'template-123',
      inputData: { test: 'input' }
    });

    expect(execution.retry_count).toBe(1);
    expect(execution.status).toBe('succeeded');
  });
});
```

## Development Commands

### Application Lifecycle
```bash
# Start development server with hot reload
npm run start:dev

# Run in production mode
npm run start:prod

# Build application
npm run build
```

### Testing Commands
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run integration tests only
npm run test:e2e

# Run specific test file
npm run test -- --testPathPattern=companies.spec.ts

# Watch mode for TDD
npm run test:watch
```

### Database Operations
```bash
# Apply migrations
supabase db push

# Reset database (destructive)
supabase db reset

# Generate new migration
supabase migration new <migration_name>

# View database in browser
supabase dashboard
```

### CLI Operations
```bash
# Check system health
npm run cli health

# List companies for user
npm run cli companies:list --user-id=<uuid>

# Trigger workflow execution
npm run cli workflows:execute --studio-id=<uuid> --template-id=<uuid>

# Monitor active executions
npm run cli executions:monitor

# Clean up old files
npm run cli files:cleanup --older-than=30d
```

## User Story Validation

### Story 1: Business Administrator Registration
**Given**: New business user visits platform  
**When**: They register company with basic information  
**Then**: They can access platform and create first studio

```bash
# Test script: validate-story-1.sh
curl -X POST http://localhost:3000/v1/companies \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"name":"Story Test Co","industry_type":"retail","contact_email":"admin@storytest.com","headquarters_address":"789 Story St, Test City, TC"}' \
  && echo "✅ Company registration successful" \
  || echo "❌ Company registration failed"
```

### Story 2: Studio Creation for Business Area
**Given**: Company is registered  
**When**: Administrator creates studio for specific business area  
**Then**: Team members can access studio and browse workflows

```bash
# Test script: validate-story-2.sh
COMPANY_ID=$(curl -s -X GET http://localhost:3000/v1/companies \
  -H "Authorization: Bearer $USER_TOKEN" | jq -r '.data[0].id')

curl -X POST http://localhost:3000/v1/companies/$COMPANY_ID/studios \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"name":"Story Test Studio","business_area":"operations"}' \
  && echo "✅ Studio creation successful" \
  || echo "❌ Studio creation failed"
```

### Story 3: Workflow Selection and Execution
**Given**: User is in studio  
**When**: They select workflow and provide input data  
**Then**: Workflow executes and returns results with status

```bash
# Test script: validate-story-3.sh
STUDIO_ID=$(curl -s -X GET http://localhost:3000/v1/companies/$COMPANY_ID/studios \
  -H "Authorization: Bearer $USER_TOKEN" | jq -r '.data[0].id')

TEMPLATE_ID=$(curl -s -X GET http://localhost:3000/v1/workflow-templates \
  -H "Authorization: Bearer $USER_TOKEN" | jq -r '.data[0].id')

curl -X POST http://localhost:3000/v1/studios/$STUDIO_ID/executions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{\"template_id\":\"$TEMPLATE_ID\",\"input_data\":{\"test\":\"story3\"}}" \
  && echo "✅ Workflow execution successful" \
  || echo "❌ Workflow execution failed"
```

## Contract Test Suite Examples

### Automated Contract Testing
Create test files that can be executed as part of TDD workflow:

```bash
# tests/contract/companies.test.sh
#!/bin/bash
set -e

BASE_URL="http://localhost:3000/v1"
TOKEN="$TEST_JWT_TOKEN"

echo "Testing Company Management API..."

# Test 1: Create company
echo "1. Testing POST /companies"
COMPANY_RESPONSE=$(curl -s -X POST "$BASE_URL/companies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contract Test Company",
    "industry_type": "technology", 
    "contact_email": "test@contracttest.com",
    "headquarters_address": "123 Contract Test St, Test City, TC"
  }')

COMPANY_ID=$(echo "$COMPANY_RESPONSE" | jq -r '.id')
echo "✅ Company created: $COMPANY_ID"

# Test 2: Get company
echo "2. Testing GET /companies/{id}"
curl -s -X GET "$BASE_URL/companies/$COMPANY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.name' | grep -q "Contract Test Company" \
  && echo "✅ Company retrieval successful" \
  || echo "❌ Company retrieval failed"

# Test 3: List companies
echo "3. Testing GET /companies"
curl -s -X GET "$BASE_URL/companies" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data | length' | grep -q "[1-9]" \
  && echo "✅ Company listing successful" \
  || echo "❌ Company listing failed"
```

```bash
# tests/contract/studios.test.sh
#!/bin/bash
set -e

BASE_URL="http://localhost:3000/v1"
TOKEN="$TEST_JWT_TOKEN" 
COMPANY_ID="$TEST_COMPANY_ID"

echo "Testing Studio Management API..."

# Test 1: Create studio
echo "1. Testing POST /companies/{id}/studios"
STUDIO_RESPONSE=$(curl -s -X POST "$BASE_URL/companies/$COMPANY_ID/studios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contract Test Studio",
    "business_area": "marketing",
    "description": "Studio for contract testing"
  }')

STUDIO_ID=$(echo "$STUDIO_RESPONSE" | jq -r '.id')
echo "✅ Studio created: $STUDIO_ID"

# Test 2: List studios
echo "2. Testing GET /companies/{id}/studios"
curl -s -X GET "$BASE_URL/companies/$COMPANY_ID/studios" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data[0].name' | grep -q "Contract Test Studio" \
  && echo "✅ Studio listing successful" \
  || echo "❌ Studio listing failed"

# Test 3: Filter studios by business area
echo "3. Testing GET /companies/{id}/studios?business_area=marketing"
curl -s -X GET "$BASE_URL/companies/$COMPANY_ID/studios?business_area=marketing" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data | length' | grep -q "[1-9]" \
  && echo "✅ Studio filtering successful" \
  || echo "❌ Studio filtering failed"
```

```bash
# tests/contract/workflows.test.sh
#!/bin/bash
set -e

BASE_URL="http://localhost:3000/v1"
TOKEN="$TEST_JWT_TOKEN"
STUDIO_ID="$TEST_STUDIO_ID"

echo "Testing Workflow Execution API..."

# Test 1: Browse workflow templates
echo "1. Testing GET /workflow-templates"
TEMPLATES_RESPONSE=$(curl -s -X GET "$BASE_URL/workflow-templates?business_area=marketing" \
  -H "Authorization: Bearer $TOKEN")

TEMPLATE_ID=$(echo "$TEMPLATES_RESPONSE" | jq -r '.data[0].id')
echo "✅ Template browsing successful: $TEMPLATE_ID"

# Test 2: Execute workflow
echo "2. Testing POST /studios/{id}/executions"
EXECUTION_RESPONSE=$(curl -s -X POST "$BASE_URL/studios/$STUDIO_ID/executions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"template_id\": \"$TEMPLATE_ID\",
    \"input_data\": {
      \"campaign_name\": \"Contract Test Campaign\",
      \"target_audience\": \"developers\"
    }
  }")

EXECUTION_ID=$(echo "$EXECUTION_RESPONSE" | jq -r '.id')
echo "✅ Workflow execution started: $EXECUTION_ID"

# Test 3: Check execution status
echo "3. Testing GET /executions/{id}"
curl -s -X GET "$BASE_URL/executions/$EXECUTION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.status' | grep -q '"pending"' \
  && echo "✅ Execution status check successful" \
  || echo "❌ Execution status check failed"

# Test 4: List executions
echo "4. Testing GET /studios/{id}/executions"
curl -s -X GET "$BASE_URL/studios/$STUDIO_ID/executions" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data | length' | grep -q "[1-9]" \
  && echo "✅ Execution listing successful" \
  || echo "❌ Execution listing failed"
```

```bash
# tests/contract/files.test.sh
#!/bin/bash
set -e

BASE_URL="http://localhost:3000/v1"
TOKEN="$TEST_JWT_TOKEN"
STUDIO_ID="$TEST_STUDIO_ID"

echo "Testing File Management API..."

# Create test file
echo "Contract test file content" > /tmp/contract-test.txt

# Test 1: Upload file
echo "1. Testing POST /studios/{id}/files"
FILE_RESPONSE=$(curl -s -X POST "$BASE_URL/studios/$STUDIO_ID/files" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/contract-test.txt" \
  -F "access_level=studio")

FILE_ID=$(echo "$FILE_RESPONSE" | jq -r '.id')
echo "✅ File upload successful: $FILE_ID"

# Test 2: Get file details
echo "2. Testing GET /files/{id}"
curl -s -X GET "$BASE_URL/files/$FILE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.filename' | grep -q "contract-test.txt" \
  && echo "✅ File details retrieval successful" \
  || echo "❌ File details retrieval failed"

# Test 3: List studio files
echo "3. Testing GET /studios/{id}/files"
curl -s -X GET "$BASE_URL/studios/$STUDIO_ID/files" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data | length' | grep -q "[1-9]" \
  && echo "✅ File listing successful" \
  || echo "❌ File listing failed"

# Test 4: Download file
echo "4. Testing GET /files/{id}/download"
curl -s -X GET "$BASE_URL/files/$FILE_ID/download" \
  -H "Authorization: Bearer $TOKEN" \
  | grep -q "Contract test file content" \
  && echo "✅ File download successful" \
  || echo "❌ File download failed"

# Cleanup
rm -f /tmp/contract-test.txt
```

### Simple Contract Test (Constitutional Compliance)
```bash
# Single script: test-contracts.sh
#!/bin/bash
set -e

BASE_URL="http://localhost:3000/v1"
TOKEN=$(supabase auth get-token)

echo "Testing Studios AI API contracts..."

# Test 1: Health check (no auth)
curl -f "$BASE_URL/health" && echo "✅ Health check passed"

# Test 2: Create company
COMPANY=$(curl -f -X POST "$BASE_URL/companies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Co","industry_type":"technology","contact_email":"test@test.com","headquarters_address":"123 Test St"}')
COMPANY_ID=$(echo "$COMPANY" | jq -r '.id')
echo "✅ Company created: $COMPANY_ID"

# Test 3: Create studio
STUDIO=$(curl -f -X POST "$BASE_URL/companies/$COMPANY_ID/studios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Studio","business_area":"marketing"}')
STUDIO_ID=$(echo "$STUDIO" | jq -r '.id')
echo "✅ Studio created: $STUDIO_ID"

# Test 4: List workflow templates
curl -f "$BASE_URL/workflow-templates" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo "✅ Workflow templates listed"

# Test 5: Upload file
echo "test content" > /tmp/test.txt
curl -f -X POST "$BASE_URL/studios/$STUDIO_ID/files" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test.txt" > /dev/null
echo "✅ File uploaded"

echo "✅ All basic contract tests passed!"
```

## Troubleshooting

### Common Issues

**Authentication Errors (401)**
- Verify JWT token is valid and not expired
- Check Supabase project configuration
- Ensure user exists in auth.users table

**Access Denied Errors (403)**
- Verify user belongs to company (user_companies table)
- Check RLS policies are properly configured
- Ensure user has 'approved' status in user_companies

**ActivePieces Integration Failures**
- Verify API key and endpoint configuration
- Check network connectivity to ActivePieces service
- Review ActivePieces flow configuration and permissions

**Database Connection Issues**
- Verify Supabase URL and service role key
- Check connection pool settings
- Ensure database migrations are applied

### Debug Mode
```bash
# Enable detailed logging
export LOG_LEVEL=debug
export NODE_ENV=development

# Start with debugging
npm run start:debug
```

### Performance Testing
```bash
# Load test workflow execution endpoint
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  -p execution-payload.json \
  -T application/json \
  http://localhost:3000/v1/studios/$STUDIO_ID/executions

# Monitor database performance
supabase db logs --level=info
```

## Success Criteria

### Functional Requirements Validation
- ✅ Company registration and hierarchy support
- ✅ Studio creation and management
- ✅ Workflow template browsing and filtering
- ✅ Workflow execution with real-time status tracking
- ✅ File upload and access controls
- ✅ User authentication and company-based access control

### Performance Requirements
- ✅ 30,000+ req/sec with Fastify adapter (load testing)
- ✅ Real-time workflow status updates via WebSocket/polling
- ✅ Database query performance < 500ms for complex queries

### Security Requirements
- ✅ JWT authentication with Supabase Auth
- ✅ Row Level Security policies for data isolation
- ✅ Input validation and rate limiting
- ✅ Secure file storage with access controls

---

**Quickstart Status**: ✅ Complete  
**Test Coverage**: Contract, Integration, and User Story validation  
**Ready for**: Implementation with TDD approach