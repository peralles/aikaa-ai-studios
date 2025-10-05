# Quickstart Guide: Aikaa AI Studio Multi-Tenant Platform

## Overview
This guide walks through the core user workflows to validate the multi-tenant productivity platform. Each scenario represents critical functionality that must work seamlessly.

## Prerequisites
- Platform with seeded test data
- Test users with different roles
- Sample tenant with companies

## Test Data Setup
```json
{
  "tenants": [
    {
      "id": "tenant-acme",
      "name": "Acme Corporation", 
      "slug": "acme-corp"
    }
  ],
  "companies": [
    {
      "id": "company-hq",
      "tenant_id": "tenant-acme",
      "name": "Acme HQ",
      "type": "parent"
    },
    {
      "id": "company-west",
      "tenant_id": "tenant-acme", 
      "name": "Acme West",
      "type": "subsidiary",
      "parent_company_id": "company-hq"
    }
  ],
  "users": [
    {
      "id": "platform-admin",
      "email": "admin@aikaa.ai",
      "platform_role": "platform_admin"
    },
    {
      "id": "company-admin", 
      "email": "admin@acme.com",
      "platform_role": "tenant_user"
    },
    {
      "id": "normal-user",
      "email": "user@acme.com", 
      "platform_role": "tenant_user"
    }
  ]
}
```

## Scenario 1: Platform Admin Setup (Multi-Tenant Management)

### Steps:
1. **Login as Platform Admin**
   - Navigate to `/login`
   - Enter: `admin@aikaa.ai` / `password`
   - Verify redirect to platform dashboard

2. **Create New Tenant**
   - Click "Add Tenant"
   - Fill form:
     - Name: "TechCorp Solutions"
     - Slug: "techcorp"
     - Tier: "Enterprise"
   - Submit and verify tenant created

3. **Setup Parent Company**
   - Navigate to new tenant
   - Click "Add Company"
   - Fill form:
     - Name: "TechCorp HQ"
     - Type: "Parent Company"
   - Submit and verify company created

4. **Add Subsidiary Companies**
   - Click "Add Company" again
   - Fill form:
     - Name: "TechCorp East"
     - Type: "Subsidiary"
     - Parent: "TechCorp HQ"
   - Repeat for "TechCorp West"
   - Verify hierarchical display

### Expected Results:
- ✅ Tenant isolation: Cannot see other tenants' data
- ✅ Company hierarchy: Parent/child relationships visible
- ✅ Audit logging: All actions recorded in audit trail
- ✅ Navigation: Breadcrumbs show current context

## Scenario 2: Company Admin Workflow (User & Studio Management)

### Steps:
1. **Login as Company Admin**
   - Navigate to `/login`
   - Enter: `admin@acme.com` / `password`
   - Verify redirect to company dashboard
   - Confirm access to "Acme HQ" and "Acme West"

2. **Invite New User**
   - Select "Acme HQ" context
   - Navigate to Users section
   - Click "Invite User"
   - Fill form:
     - Email: `newuser@acme.com`
     - Role: "User"
     - Companies: "Acme HQ", "Acme West"
   - Send invitation

3. **Create Sales Studio**
   - Navigate to Studios section
   - Click "Create Studio"
   - Fill form:
     - Name: "Q4 Sales Pipeline"
     - Type: "Opportunity"
     - Description: "Track Q4 sales opportunities"
   - Configure columns:
     - Prospect → Qualified → Proposal → Negotiation → Closed
   - Save and verify studio created

4. **Test Multi-Company Access**
   - Switch to "Acme West" context
   - Verify different studios/users visible
   - Create separate studio: "West Region Leads"
   - Type: "Lead"
   - Confirm type restriction enforced

### Expected Results:
- ✅ Multi-company access: Can switch between accessible companies
- ✅ Role enforcement: Admin actions allowed
- ✅ Studio type validation: Cannot mix card types
- ✅ Context switching: Data filtered by selected company

## Scenario 3: Normal User Workflow (Card Management)

### Steps:
1. **Login as Normal User**
   - Navigate to `/login`
   - Enter: `user@acme.com` / `password`
   - Verify access to assigned companies only

2. **Create Opportunity Card**
   - Navigate to "Q4 Sales Pipeline" studio
   - Click "Add Card"
   - Fill form:
     - Title: "Microsoft Enterprise Deal"
     - Client: "Microsoft Corp"
     - Value: $150,000
     - Probability: 70%
     - Close Date: "Dec 15, 2025"
   - Assign to self
   - Save in "Prospect" column

3. **Move Card Through Workflow**
   - Drag card from "Prospect" to "Qualified"
   - Verify status update and notification
   - Add comment: "Initial call went well, scheduling demo"
   - Move to "Proposal" column
   - Update probability to 85%

4. **Collaborate on Card**
   - Add another comment with attachment
   - @mention company admin: "Need approval for pricing"
   - Verify admin receives notification
   - Admin responds with approval
   - Move card to "Negotiation"

5. **Test Card Type Restrictions**
   - Try to create "Lead" card in opportunity studio
   - Verify error: "This studio only accepts Opportunity cards"
   - Navigate to leads studio
   - Successfully create lead card

### Expected Results:
- ✅ Card creation: Form validates against studio type
- ✅ Workflow movement: Drag-and-drop updates status
- ✅ Real-time updates: Changes visible to other users
- ✅ Commenting: Collaboration features work
- ✅ Notifications: Users notified of relevant changes
- ✅ Type enforcement: Cannot mix card types in studio

## Scenario 4: Multi-Tenant Isolation Validation

### Steps:
1. **Setup Second Tenant**
   - Platform admin creates "CompetitorCorp" tenant
   - Add companies and users to new tenant

2. **Test Data Isolation**
   - Login as CompetitorCorp user
   - Verify cannot see Acme data
   - Create studios with same names as Acme
   - Confirm no conflicts or data leakage

3. **Test URL Tampering**
   - As Acme user, try accessing CompetitorCorp URLs directly
   - Verify 404/403 errors, not data exposure
   - Check API endpoints return filtered results

4. **Database Query Validation**
   - Run sample queries with RLS enabled
   - Confirm tenant_id filtering applied automatically  
   - Verify no cross-tenant data visible

### Expected Results:
- ✅ Complete isolation: No cross-tenant data access
- ✅ URL security: Direct access blocked appropriately
- ✅ Database security: RLS policies enforced
- ✅ Performance: Isolation doesn't impact speed

## Scenario 5: Performance & Scale Testing

### Steps:
1. **Load Test Data**
   - Create 100 companies across 10 tenants
   - Generate 1000 users with varied access patterns
   - Create 50 studios with 10,000 total cards

2. **Test Concurrent Users**
   - Simulate 100 concurrent users
   - Perform typical operations (view, create, update cards)
   - Measure response times

3. **Test Large Kanban Boards**
   - Create studio with 1000+ cards
   - Test virtual scrolling performance
   - Measure rendering and interaction responsiveness

4. **Database Performance**
   - Monitor query performance under load
   - Check index utilization
   - Verify RLS policy efficiency

### Expected Results:
- ✅ Response times: <200ms for all operations
- ✅ Concurrent users: 100+ users without degradation
- ✅ Large datasets: Virtual scrolling handles 1000+ cards
- ✅ Database: Optimized queries with proper indexing

## Scenario 6: Error Handling & Edge Cases

### Steps:
1. **Network Interruption**
   - Start creating card
   - Disconnect network mid-operation
   - Reconnect and verify state consistency

2. **Concurrent Modifications**
   - Two users edit same card simultaneously
   - Verify conflict resolution
   - Check audit trail accuracy

3. **Invalid Operations**
   - Try to delete parent company with subsidiaries
   - Attempt to move card to non-existent status
   - Test with invalid user permissions

4. **Data Limits**
   - Test maximum card description length
   - Try uploading oversized attachments
   - Verify graceful degradation

### Expected Results:
- ✅ Offline resilience: Operations queue and retry
- ✅ Conflict resolution: Last-write-wins with notifications
- ✅ Validation: Clear error messages for invalid operations
- ✅ Limits: Proper handling of size/count constraints

## Success Criteria

All scenarios must complete successfully with:
- **Functional**: All features work as specified
- **Performance**: Response times under 200ms
- **Security**: Multi-tenant isolation maintained
- **Usability**: Intuitive workflows, clear feedback
- **Reliability**: No data loss or corruption
- **Scalability**: Handles expected enterprise load

## Automated Test Coverage

Each scenario should have corresponding automated tests:
- **E2E Tests**: Complete user workflows (Playwright)
- **Integration Tests**: API contract validation  
- **Unit Tests**: Component and business logic
- **Load Tests**: Performance under scale
- **Security Tests**: Tenant isolation verification

This quickstart guide validates the core value proposition of a secure, scalable, multi-tenant productivity platform with excellent user experience.