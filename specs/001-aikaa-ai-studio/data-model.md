# Data Model: Aikaa AI Studio Multi-Tenant Platform

## Core Entities

### Tenant (Parent Company)
**Purpose**: Top-level isolation boundary for multi-tenant architecture
**Attributes**:
- `id` (uuid, primary key)
- `name` (text, required) - Display name
- `slug` (text, unique) - URL-friendly identifier
- `subscription_tier` (enum: basic, pro, enterprise)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `settings` (jsonb) - Tenant-specific configuration

**Validation Rules**:
- Slug must be unique across all tenants
- Name must be 3-50 characters
- Cannot be deleted if active companies exist

### Company
**Purpose**: Business entities within a tenant (subsidiaries, franchises, partners)
**Attributes**:
- `id` (uuid, primary key)
- `tenant_id` (uuid, foreign key to tenants)
- `parent_company_id` (uuid, nullable, self-reference for hierarchy)
- `name` (text, required)
- `type` (enum: parent, subsidiary, franchise, partner)
- `status` (enum: active, inactive, suspended)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `settings` (jsonb) - Company-specific configuration

**Relationships**:
- Belongs to one Tenant
- Can have parent Company (hierarchical structure)
- Has many Users through UserCompanyAccess
- Has many Studios

**Validation Rules**:
- Parent company must belong to same tenant
- Cannot create circular hierarchy
- Name unique within tenant

### User
**Purpose**: Platform participants with role-based access
**Attributes**:
- `id` (uuid, primary key, matches Supabase auth.users.id)
- `email` (text, unique, required)
- `first_name` (text, required)
- `last_name` (text, required)
- `avatar_url` (text, nullable)
- `platform_role` (enum: platform_admin, tenant_user)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `last_login_at` (timestamp)

**Relationships**:
- Has many UserCompanyAccess (many-to-many with Companies)
- Has many Cards (assigned cards)
- Has many AuditLogs (activity tracking)

**Validation Rules**:
- Email format validation
- Platform admins have unrestricted access
- Cannot delete if assigned to active cards

### UserCompanyAccess
**Purpose**: Defines user access to specific companies with roles
**Attributes**:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `company_id` (uuid, foreign key to companies)
- `role` (enum: admin, user)
- `granted_at` (timestamp)
- `granted_by` (uuid, foreign key to users)
- `revoked_at` (timestamp, nullable)

**Relationships**:
- Belongs to one User
- Belongs to one Company
- References granting User

**Validation Rules**:
- User can only have one active role per company
- Admin users can grant/revoke access within their company
- Platform admins can access any company

### Studio (Kanban Board)
**Purpose**: Workflow management boards restricted to single card type
**Attributes**:
- `id` (uuid, primary key)
- `company_id` (uuid, foreign key to companies)
- `name` (text, required)
- `description` (text, nullable)
- `card_type` (enum: lead, opportunity, customer, sale, task)
- `status` (enum: active, archived)
- `column_config` (jsonb) - Ordered list of workflow stages
- `created_by` (uuid, foreign key to users)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Relationships**:
- Belongs to one Company
- Has many Cards
- Created by one User

**Validation Rules**:
- Name unique within company
- Card type cannot be changed after creation
- Must have at least 2 columns
- Column names unique within studio

**Default Column Configuration**:
```json
{
  "columns": [
    {"id": "todo", "name": "To Do", "order": 1},
    {"id": "in_progress", "name": "In Progress", "order": 2},
    {"id": "review", "name": "In Review", "order": 3},
    {"id": "done", "name": "Done", "order": 4}
  ]
}
```

### Card
**Purpose**: Configurable business entities managed within Studios
**Attributes**:
- `id` (uuid, primary key)
- `studio_id` (uuid, foreign key to studios)
- `title` (text, required)
- `description` (text, nullable)
- `card_type` (text, must match studio.card_type)
- `config` (jsonb) - Type-specific fields
- `status` (text) - Current column/stage
- `priority` (enum: low, medium, high, urgent)
- `assigned_to` (uuid, nullable, foreign key to users)
- `created_by` (uuid, foreign key to users)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `due_date` (date, nullable)

**Relationships**:
- Belongs to one Studio
- Assigned to one User (optional)
- Created by one User
- Has many CardComments
- Has many AuditLogs

**Validation Rules**:
- Card type must match studio card type
- Status must be valid column in studio config
- Assigned user must have access to company
- Title must be 3-200 characters

**Type-Specific Configurations**:

**Lead**:
```json
{
  "contact_name": "string",
  "company": "string",
  "email": "string",
  "phone": "string",
  "source": "string",
  "estimated_value": "number"
}
```

**Opportunity**:
```json
{
  "client_name": "string",
  "value": "number",
  "probability": "number",
  "close_date": "date",
  "stage": "string"
}
```

**Task**:
```json
{
  "estimated_hours": "number",
  "actual_hours": "number",
  "project": "string",
  "tags": ["string"]
}
```

### CardComment
**Purpose**: Communication thread for card collaboration
**Attributes**:
- `id` (uuid, primary key)
- `card_id` (uuid, foreign key to cards)
- `user_id` (uuid, foreign key to users)
- `content` (text, required)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `edited_at` (timestamp, nullable)

**Relationships**:
- Belongs to one Card
- Belongs to one User

**Validation Rules**:
- Content must be 1-2000 characters
- User can only edit own comments
- Cannot delete comments (audit trail)

### AuditLog
**Purpose**: Track all system changes for compliance and debugging
**Attributes**:
- `id` (uuid, primary key)
- `tenant_id` (uuid, foreign key to tenants)
- `user_id` (uuid, foreign key to users)
- `entity_type` (text) - Table name
- `entity_id` (uuid) - Record ID
- `action` (enum: create, update, delete)
- `old_values` (jsonb, nullable)
- `new_values` (jsonb, nullable)
- `created_at` (timestamp)

**Relationships**:
- Belongs to one Tenant
- Belongs to one User

**Validation Rules**:
- Immutable after creation
- Required for all entity modifications
- Automatically populated via triggers

### Notification
**Purpose**: System notifications for user actions
**Attributes**:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to users)
- `type` (enum: card_assigned, card_moved, comment_added, user_added)
- `title` (text, required)
- `message` (text, required)
- `entity_type` (text, nullable)
- `entity_id` (uuid, nullable)
- `read_at` (timestamp, nullable)
- `created_at` (timestamp)

**Relationships**:
- Belongs to one User

**Validation Rules**:
- Notifications expire after 30 days
- Cannot be modified after creation

## Entity Relationships Summary

```
Tenant (1) -> (many) Company
Company (1) -> (many) Studio
Company (many) <-> (many) User [via UserCompanyAccess]
Studio (1) -> (many) Card
Card (1) -> (many) CardComment
User (1) -> (many) Card [assigned]
User (1) -> (many) Notification
All entities -> (many) AuditLog
```

## Row Level Security (RLS) Policies

### Tenant Isolation
```sql
-- All tables include tenant_id context
CREATE POLICY tenant_isolation ON companies
FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation ON studios  
FOR ALL USING (company_id IN (
  SELECT id FROM companies 
  WHERE tenant_id = current_setting('app.current_tenant')::uuid
));
```

### User Access Control
```sql
-- Users can only access companies they have access to
CREATE POLICY user_company_access ON studios
FOR ALL USING (company_id IN (
  SELECT company_id FROM user_company_access 
  WHERE user_id = auth.uid() AND revoked_at IS NULL
));
```

## Database Indexes

**Performance-Critical Indexes**:
- `companies(tenant_id)` - Tenant filtering
- `studios(company_id)` - Company filtering  
- `cards(studio_id, status)` - Kanban queries
- `cards(assigned_to)` - User assignments
- `user_company_access(user_id, company_id)` - Permission checks
- `audit_logs(tenant_id, created_at)` - Audit queries
- `notifications(user_id, read_at)` - Notification queries

## Data Migration Strategy

1. **Phase 1**: Core multi-tenant structure (Tenant, Company, User)
2. **Phase 2**: Workflow management (Studio, Card)
3. **Phase 3**: Collaboration features (Comment, Notification)
4. **Phase 4**: Audit and compliance (AuditLog, enhanced RLS)

Each phase includes comprehensive seed data for testing multi-tenant scenarios.