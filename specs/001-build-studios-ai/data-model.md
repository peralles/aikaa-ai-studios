# Data Model: Studios AI Backend Platform

**Feature**: Studios AI Backend Platform  
**Date**: 2025-10-04  
**Phase**: 1 - Design & Contracts

## Core Entities

### Company
**Purpose**: Represents a business organization with hierarchical structure  
**Source**: FR-001, FR-002, FR-003

```typescript
interface Company {
  id: string;                    // UUID primary key
  name: string;                  // Company name (required, 3-100 chars)
  industry_type: string;         // Industry classification (required)
  contact_email: string;         // Primary contact email (required, valid email)
  contact_phone?: string;        // Optional phone number
  headquarters_address: string;  // Physical headquarters address (required)
  created_at: timestamp;         // Auto-generated creation time
  updated_at: timestamp;         // Auto-updated modification time
  
  // Relationships
  studios: Studio[];            // One-to-many: Company has many Studios
  branches: CompanyBranch[];    // One-to-many: Company has many Branches
  users: UserCompany[];         // Many-to-many: Company has many Users
}
```

**Validation Rules**:
- `name`: Required, 3-100 characters, unique per user
- `industry_type`: Required, from predefined enum
- `contact_email`: Required, valid email format
- `headquarters_address`: Required, minimum 10 characters

**State Transitions**: None (stable entity)

### CompanyBranch (SIMPLIFIED)
**Purpose**: Company hierarchical structure stored as JSON field in Company entity  
**Source**: FR-003

```typescript
// Removed separate table - store as JSON array in Company.branches
interface CompanyBranchInfo {
  name: string;                  // Branch name
  address: string;               // Branch address
  contact_email?: string;        // Optional contact
  contact_phone?: string;        // Optional phone
}

// Updated Company entity to include branches
interface Company {
  // ... existing fields
  branches: CompanyBranchInfo[]; // JSON array of branch info
}
```

**Rationale**: Constitutional principle of simplicity - avoid unnecessary tables for hierarchical data that can be stored as JSON.

### User
**Purpose**: Business team member with role-based access to company studios  
**Source**: FR-002, FR-005, FR-017

```typescript
interface User {
  id: string;                    // UUID primary key (from Supabase Auth)
  email: string;                 // User email (from Supabase Auth)
  full_name: string;             // User display name (required)
  created_at: timestamp;         // Auto-generated creation time
  last_login_at?: timestamp;     // Last authentication time
  
  // Relationships
  companies: UserCompany[];      // Many-to-many: User belongs to many Companies
  workflow_executions: WorkflowExecution[]; // One-to-many: User executes workflows
  files: File[];                 // One-to-many: User uploads files
}
```

**Validation Rules**:
- `email`: Managed by Supabase Auth, valid email format
- `full_name`: Required, 2-100 characters

**State Transitions**: 
- `active` ↔ `inactive` (account status)

### UserCompany
**Purpose**: Junction table for many-to-many User-Company relationship with access control  
**Source**: FR-002, FR-005

```typescript
interface UserCompany {
  id: string;                    // UUID primary key
  user_id: string;               // Foreign key to User
  company_id: string;            // Foreign key to Company
  role: 'admin' | 'member';      // User role within company
  status: 'pending' | 'approved' | 'rejected'; // Join request status
  joined_at?: timestamp;         // Approval timestamp
  created_at: timestamp;         // Request creation time
  
  // Relationships
  user: User;                    // Many-to-one: Association to User
  company: Company;              // Many-to-one: Association to Company
}
```

**Validation Rules**:
- `user_id`: Required, must exist in users table
- `company_id`: Required, must exist in companies table
- `role`: Required, enum value
- `status`: Required, enum value
- Unique constraint on (user_id, company_id)

**State Transitions**:
- `pending` → `approved` (admin approval)
- `pending` → `rejected` (admin rejection)
- `approved` → `inactive` (access revocation)

### Studio
**Purpose**: Specialized automation workspace within a company for specific business areas  
**Source**: FR-004, FR-005

```typescript
interface Studio {
  id: string;                    // UUID primary key
  company_id: string;            // Foreign key to Company
  name: string;                  // Studio name (required, 3-100 chars)
  description?: string;          // Studio purpose description
  business_area: string;         // Focus area (marketing, sales, operations, support)
  created_by: string;            // User ID who created studio
  created_at: timestamp;         // Auto-generated creation time
  updated_at: timestamp;         // Auto-updated modification time
  
  // Relationships
  company: Company;              // Many-to-one: Studio belongs to Company
  workflow_executions: WorkflowExecution[]; // One-to-many: Studio has executions
  files: File[];                 // One-to-many: Studio contains files
}
```

**Validation Rules**:
- `company_id`: Required, must exist in companies table
- `name`: Required, 3-100 characters, unique within company
- `business_area`: Required, from predefined enum
- `created_by`: Required, must be valid user with company access

**State Transitions**: None (stable entity)

### WorkflowTemplate
**Purpose**: Pre-built automation process definition that solves common business problems  
**Source**: FR-006, FR-007

```typescript
interface WorkflowTemplate {
  id: string;                    // UUID primary key
  name: string;                  // Template name (required)
  description: string;           // Template description (required)
  business_area: string;         // Target business area
  activepieces_flow_id: string;  // ActivePieces flow identifier
  input_schema: object;          // JSON schema for required inputs
  output_schema: object;         // JSON schema for expected outputs
  estimated_duration_minutes: number; // Expected execution time
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];                // Searchable tags
  version: string;               // Template version (semver)
  is_active: boolean;            // Template availability status
  created_at: timestamp;         // Auto-generated creation time
  updated_at: timestamp;         // Auto-updated modification time
  
  // Relationships
  executions: WorkflowExecution[]; // One-to-many: Template has executions
}
```

**Validation Rules**:
- `name`: Required, 3-200 characters, unique
- `description`: Required, 10-1000 characters
- `activepieces_flow_id`: Required, valid UUID format
- `input_schema`: Required, valid JSON schema
- `estimated_duration_minutes`: Required, positive integer
- `version`: Required, semantic version format

### WorkflowExecution
**Purpose**: Instance of a workflow run with specific input data and execution tracking  
**Source**: FR-008, FR-009, FR-011

```typescript
interface WorkflowExecution {
  id: string;                    // UUID primary key
  studio_id: string;             // Foreign key to Studio
  template_id: string;           // Foreign key to WorkflowTemplate
  user_id: string;               // Foreign key to User (executor)
  input_data: object;            // User-provided input data (JSON)
  output_data?: object;          // Workflow results (JSON, nullable)
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'paused';
  activepieces_run_id?: string;  // ActivePieces execution identifier
  started_at?: timestamp;        // Execution start time
  completed_at?: timestamp;      // Execution completion time
  duration_seconds?: number;     // Total execution time
  error_message?: string;        // Error details for failed executions
  retry_count: number;           // Number of retry attempts
  logs: object[];                // Execution logs array (JSON)
  created_at: timestamp;         // Auto-generated creation time
  
  // Relationships
  studio: Studio;                // Many-to-one: Execution belongs to Studio
  template: WorkflowTemplate;    // Many-to-one: Execution uses Template
  user: User;                    // Many-to-one: Execution by User
}
```

**Validation Rules**:
- `studio_id`: Required, must exist in studios table
- `template_id`: Required, must exist in workflow_templates table
- `user_id`: Required, must exist in users table with studio access
- `input_data`: Required, must conform to template input_schema
- `status`: Required, enum value
- `retry_count`: Non-negative integer, max 3

**State Transitions**:
- `pending` → `running` (execution starts)
- `running` → `succeeded` (successful completion)
- `running` → `failed` (execution failure)
- `running` → `paused` (manual pause)
- `failed` → `pending` (retry attempt)
- `paused` → `running` (resume execution)

### File
**Purpose**: Documents, images, or data files uploaded by users for workflow processing  
**Source**: FR-014, FR-015, FR-016

```typescript
interface File {
  id: string;                    // UUID primary key
  studio_id: string;             // Foreign key to Studio
  uploaded_by: string;           // Foreign key to User
  filename: string;              // Original filename
  file_size: number;             // File size in bytes
  mime_type: string;             // File MIME type
  supabase_path: string;         // Supabase Storage path
  upload_timestamp: timestamp;   // Upload completion time
  last_accessed?: timestamp;     // Last access time for cleanup
  access_level: 'private' | 'studio' | 'company'; // Access permissions
  metadata?: object;             // Additional file metadata (JSON)
  
  // Relationships
  studio: Studio;                // Many-to-one: File belongs to Studio
  uploader: User;                // Many-to-one: File uploaded by User
  workflow_executions: WorkflowExecutionFile[]; // Many-to-many: Files used in executions
}
```

**Validation Rules**:
- `studio_id`: Required, must exist in studios table
- `uploaded_by`: Required, must exist in users table with studio access
- `filename`: Required, 1-255 characters, valid filename
- `file_size`: Required, positive integer, within quota limits
- `mime_type`: Required, from allowed MIME types list
- `supabase_path`: Required, unique storage path

**State Transitions**: None (stable entity)

### WorkflowExecutionFile (SIMPLIFIED)
**Purpose**: File associations stored as JSON array in WorkflowExecution  
**Source**: FR-014, FR-015

```typescript
// Removed junction table - store as JSON array in WorkflowExecution
interface FileUsage {
  file_id: string;               // Reference to File
  usage_type: 'input' | 'output'; // How file was used
}

// Updated WorkflowExecution entity
interface WorkflowExecution {
  // ... existing fields
  files_used: FileUsage[];       // JSON array of file associations
}
```

**Rationale**: Constitutional simplicity - avoid junction tables for simple many-to-many relationships that can be JSON arrays.

## Kanban Entities

### KanbanBoard
**Purpose**: Visual project management tool within a studio with customizable stages  
**Source**: FR-021, FR-022, FR-027

```typescript
interface KanbanBoard {
  id: string;                    // UUID primary key
  studio_id: string;             // Foreign key to Studio
  name: string;                  // Board name (required, 3-100 chars)
  description?: string;          // Board purpose description
  created_by: string;            // User ID who created board
  created_at: timestamp;         // Auto-generated creation time
  updated_at: timestamp;         // Auto-updated modification time
  
  // Relationships
  studio: Studio;                // Many-to-one: Board belongs to Studio
  stages: KanbanStage[];         // One-to-many: Board has stages
  cards: KanbanCard[];           // One-to-many: Board has cards
}
```

**Validation Rules**:
- `studio_id`: Required, must exist in studios table
- `name`: Required, 3-100 characters, unique within studio
- `created_by`: Required, must be valid user with studio access

**State Transitions**: None (stable entity)

### KanbanStage
**Purpose**: Customizable workflow step within a Kanban board  
**Source**: FR-022, FR-025

```typescript
interface KanbanStage {
  id: string;                    // UUID primary key
  board_id: string;              // Foreign key to KanbanBoard
  name: string;                  // Stage name (required, 2-50 chars)
  color: string;                 // Stage color (hex color code)
  position: number;              // Stage order position (0-based)
  workflow_triggers: WorkflowTriggerConfig[]; // JSON array of trigger configurations
  created_at: timestamp;         // Auto-generated creation time
  updated_at: timestamp;         // Auto-updated modification time
  
  // Relationships
  board: KanbanBoard;            // Many-to-one: Stage belongs to Board
  cards: KanbanCard[];           // One-to-many: Stage has cards
}

interface WorkflowTriggerConfig {
  template_id: string;           // WorkflowTemplate to trigger
  conditions: TriggerCondition[]; // Array of trigger conditions
  is_active: boolean;            // Whether trigger is enabled
}

interface TriggerCondition {
  type: 'stage_entry' | 'stage_exit' | 'attribute_change';
  field_name?: string;           // For attribute_change type
  field_value?: any;             // Expected value for trigger
  operator?: '=' | '!=' | '>' | '<' | 'contains';
}
```

**Validation Rules**:
- `board_id`: Required, must exist in kanban_boards table
- `name`: Required, 2-50 characters, unique within board
- `color`: Required, valid hex color format (#RRGGBB)
- `position`: Required, non-negative integer, unique within board

**State Transitions**: Position changes when reordering stages

### KanbanCard
**Purpose**: Individual task or work item with configurable custom fields  
**Source**: FR-023, FR-024, FR-025

```typescript
interface KanbanCard {
  id: string;                    // UUID primary key
  board_id: string;              // Foreign key to KanbanBoard
  stage_id: string;              // Foreign key to KanbanStage
  title: string;                 // Card title (required, 1-200 chars)
  description?: string;          // Card description (optional)
  position: number;              // Card position within stage (0-based)
  assignee_id?: string;          // Optional assigned user
  due_date?: timestamp;          // Optional due date
  custom_fields: CardCustomField[]; // JSON array of custom field values
  created_by: string;            // User ID who created card
  created_at: timestamp;         // Auto-generated creation time
  updated_at: timestamp;         // Auto-updated modification time
  
  // Relationships
  board: KanbanBoard;            // Many-to-one: Card belongs to Board
  stage: KanbanStage;            // Many-to-one: Card belongs to Stage
  assignee?: User;               // Many-to-one: Card assigned to User
  creator: User;                 // Many-to-one: Card created by User
}

interface CardCustomField {
  field_name: string;            // Custom field name
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
  field_value: any;              // Field value (typed by field_type)
  field_config?: object;         // Additional field configuration
}
```

**Validation Rules**:
- `board_id`: Required, must exist in kanban_boards table
- `stage_id`: Required, must exist in kanban_stages table within same board
- `title`: Required, 1-200 characters
- `position`: Required, non-negative integer
- `assignee_id`: Optional, must exist in user_profiles table with studio access
- `custom_fields`: Each field must have valid type and conform to field_config

**State Transitions**:
- Position changes within stage (reordering)
- `stage_id` changes when moving between stages (triggers workflows)
- `custom_fields` changes trigger workflow conditions

### CardFieldDefinition
**Purpose**: Studio-level configuration for available custom fields on Kanban cards  
**Source**: FR-023

```typescript
interface CardFieldDefinition {
  id: string;                    // UUID primary key
  studio_id: string;             // Foreign key to Studio
  field_name: string;            // Field name (required, 1-50 chars)
  field_type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
  field_config: object;          // Type-specific configuration
  is_required: boolean;          // Whether field is required on cards
  display_order: number;         // Field display order
  created_at: timestamp;         // Auto-generated creation time
  
  // Relationships
  studio: Studio;                // Many-to-one: Field belongs to Studio
}

interface TextFieldConfig {
  max_length: number;            // Maximum text length
  placeholder?: string;          // Input placeholder text
}

interface NumberFieldConfig {
  min_value?: number;            // Minimum allowed value
  max_value?: number;            // Maximum allowed value
  decimal_places: number;        // Number of decimal places
}

interface DateFieldConfig {
  min_date?: string;             // Minimum allowed date (ISO string)
  max_date?: string;             // Maximum allowed date (ISO string)
  include_time: boolean;         // Whether to include time component
}

interface DropdownFieldConfig {
  options: string[];             // Available dropdown options
  allow_multiple: boolean;       // Whether multiple selection is allowed
}

interface CheckboxFieldConfig {
  default_value: boolean;        // Default checked state
  label_text: string;            // Checkbox label
}
```

**Validation Rules**:
- `studio_id`: Required, must exist in studios table
- `field_name`: Required, 1-50 characters, unique within studio
- `field_type`: Required, enum value
- `field_config`: Required, must conform to type-specific schema
- `display_order`: Required, non-negative integer

**State Transitions**: None (configuration entity)

## Analytics Entities

### Analytics (SIMPLIFIED - Real-time Views)
**Purpose**: Real-time analytics calculated from existing data via database views  
**Source**: FR-012, FR-013

```sql
-- No separate analytics table - use PostgreSQL views for real-time calculation
CREATE VIEW studio_analytics AS
SELECT 
  s.id as studio_id,
  s.name as studio_name,
  COUNT(we.id) as total_executions,
  COUNT(CASE WHEN we.status = 'succeeded' THEN 1 END) as successful_executions,
  COUNT(CASE WHEN we.status = 'failed' THEN 1 END) as failed_executions,
  AVG(we.duration_seconds) as avg_duration_seconds,
  COUNT(DISTINCT we.user_id) as unique_users,
  COUNT(f.id) as files_uploaded,
  COALESCE(SUM(f.file_size), 0) as storage_used_bytes
FROM studios s
LEFT JOIN workflow_executions we ON s.id = we.studio_id
LEFT JOIN files f ON s.id = f.studio_id
GROUP BY s.id, s.name;
```

**Rationale**: Constitutional direct integration - use database capabilities instead of complex analytics tables. Real-time data is more valuable than pre-aggregated stale data.

## Database Constraints & Indexes

### Primary Keys
- All entities use UUID primary keys for scalability and security

### Foreign Key Relationships
- All foreign keys enforce referential integrity
- Cascade delete for dependent entities (files, executions)
- Restrict delete for core entities (companies, users, studios)

### Unique Constraints
- `companies.name` per user (company names unique to creator)
- `studios.name` per company (studio names unique within company)
- `company_branches.name` per company (branch names unique within company)
- `user_companies.(user_id, company_id)` (one relationship per user-company pair)

### Indexes for Performance
- `workflow_executions.studio_id` (high query volume)
- `workflow_executions.status` (status filtering)
- `files.studio_id` (file browsing)
- `user_companies.user_id` (user access checks)
- `user_companies.company_id` (company member queries)
- `studio_analytics.studio_id, date` (composite for time-series queries)

### Row Level Security (RLS) Policies
All tables implement company-based data isolation:
```sql
-- Example RLS policy pattern
CREATE POLICY company_data_isolation ON [table_name]
  FOR ALL USING (
    [company_id_column] IN (
      SELECT company_id FROM user_companies 
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );
```

## Database Schema & Migrations

### Core Tables SQL Schema
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table (simplified with branches as JSON)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  industry_type VARCHAR(50) NOT NULL CHECK (industry_type IN ('technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'education', 'consulting', 'other')),
  contact_email VARCHAR(255) NOT NULL CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_phone VARCHAR(20),
  headquarters_address VARCHAR(500) NOT NULL CHECK (length(headquarters_address) >= 10),
  branches JSONB DEFAULT '[]', -- Store branch hierarchy as JSON array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL CHECK (length(full_name) >= 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- User-Company junction table
CREATE TABLE user_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Studios table
CREATE TABLE studios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL CHECK (length(name) >= 3),
  description TEXT,
  business_area VARCHAR(50) NOT NULL CHECK (business_area IN ('marketing', 'sales', 'operations', 'customer_support', 'finance', 'hr', 'other')),
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Workflow templates table
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL UNIQUE CHECK (length(name) >= 3),
  description TEXT NOT NULL CHECK (length(description) >= 10 AND length(description) <= 1000),
  business_area VARCHAR(50) NOT NULL CHECK (business_area IN ('marketing', 'sales', 'operations', 'customer_support', 'finance', 'hr', 'other')),
  activepieces_flow_id UUID NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB,
  estimated_duration_minutes INTEGER NOT NULL CHECK (estimated_duration_minutes > 0 AND estimated_duration_minutes <= 1440),
  complexity_level VARCHAR(20) NOT NULL CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}',
  version VARCHAR(20) NOT NULL CHECK (version ~ '^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow executions table (simplified with files as JSON)
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES workflow_templates(id),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  input_data JSONB NOT NULL,
  output_data JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'succeeded', 'failed', 'paused')),
  activepieces_run_id UUID,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER CHECK (duration_seconds >= 0),
  error_message VARCHAR(2000),
  retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0 AND retry_count <= 3),
  logs JSONB DEFAULT '[]',
  files_used JSONB DEFAULT '[]', -- Store file associations as JSON array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES user_profiles(id),
  filename VARCHAR(255) NOT NULL CHECK (length(filename) >= 1),
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 104857600),
  mime_type VARCHAR(100) NOT NULL,
  supabase_path VARCHAR(500) NOT NULL UNIQUE,
  upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  access_level VARCHAR(20) NOT NULL DEFAULT 'studio' CHECK (access_level IN ('private', 'studio', 'company')),
  metadata JSONB DEFAULT '{}'
);

-- Kanban boards table
CREATE TABLE kanban_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL CHECK (length(name) >= 3),
  description TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(studio_id, name)
);

-- Kanban stages table
CREATE TABLE kanban_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL CHECK (length(name) >= 2),
  color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  position INTEGER NOT NULL CHECK (position >= 0),
  workflow_triggers JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, name),
  UNIQUE(board_id, position)
);

-- Kanban cards table
CREATE TABLE kanban_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES kanban_stages(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL CHECK (length(title) >= 1),
  description TEXT,
  position INTEGER NOT NULL CHECK (position >= 0),
  assignee_id UUID REFERENCES user_profiles(id),
  due_date TIMESTAMP WITH TIME ZONE,
  custom_fields JSONB DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stage_id, position)
);

-- Card field definitions table
CREATE TABLE card_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  field_name VARCHAR(50) NOT NULL CHECK (length(field_name) >= 1),
  field_type VARCHAR(20) NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'dropdown', 'checkbox')),
  field_config JSONB NOT NULL DEFAULT '{}',
  is_required BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL CHECK (display_order >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(studio_id, field_name),
  UNIQUE(studio_id, display_order)
);

-- Real-time analytics view (no separate table)
CREATE VIEW studio_analytics AS
SELECT 
  s.id as studio_id,
  s.name as studio_name,
  s.company_id,
  COUNT(we.id) as total_executions,
  COUNT(CASE WHEN we.status = 'succeeded' THEN 1 END) as successful_executions,
  COUNT(CASE WHEN we.status = 'failed' THEN 1 END) as failed_executions,
  ROUND(AVG(we.duration_seconds), 2) as avg_duration_seconds,
  COUNT(DISTINCT we.user_id) as unique_users,
  COUNT(f.id) as files_uploaded,
  COALESCE(SUM(f.file_size), 0) as storage_used_bytes,
  MAX(we.completed_at) as last_execution_at
FROM studios s
LEFT JOIN workflow_executions we ON s.id = we.studio_id
LEFT JOIN files f ON s.id = f.studio_id
GROUP BY s.id, s.name, s.company_id;
```

### Performance Indexes
```sql
-- User access patterns
CREATE INDEX idx_user_companies_user_id ON user_companies(user_id) WHERE status = 'approved';
CREATE INDEX idx_user_companies_company_id ON user_companies(company_id) WHERE status = 'approved';

-- Studio and execution queries
CREATE INDEX idx_studios_company_id ON studios(company_id);
CREATE INDEX idx_studios_business_area ON studios(business_area);
CREATE INDEX idx_workflow_executions_studio_id ON workflow_executions(studio_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_created_at ON workflow_executions(created_at DESC);

-- File management
CREATE INDEX idx_files_studio_id ON files(studio_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_upload_timestamp ON files(upload_timestamp DESC);

-- Kanban management
CREATE INDEX idx_kanban_boards_studio_id ON kanban_boards(studio_id);
CREATE INDEX idx_kanban_stages_board_id ON kanban_stages(board_id);
CREATE INDEX idx_kanban_stages_position ON kanban_stages(board_id, position);
CREATE INDEX idx_kanban_cards_board_id ON kanban_cards(board_id);
CREATE INDEX idx_kanban_cards_stage_id ON kanban_cards(stage_id);
CREATE INDEX idx_kanban_cards_position ON kanban_cards(stage_id, position);
CREATE INDEX idx_kanban_cards_assignee ON kanban_cards(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX idx_kanban_cards_due_date ON kanban_cards(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_card_field_definitions_studio ON card_field_definitions(studio_id, display_order);

-- Analytics queries
CREATE INDEX idx_studio_analytics_studio_date ON studio_analytics(studio_id, date DESC);

-- Template discovery
CREATE INDEX idx_workflow_templates_business_area ON workflow_templates(business_area) WHERE is_active = true;
CREATE INDEX idx_workflow_templates_complexity ON workflow_templates(complexity_level) WHERE is_active = true;
CREATE INDEX idx_workflow_templates_tags ON workflow_templates USING GIN(tags) WHERE is_active = true;
```

### Row Level Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_analytics ENABLE ROW LEVEL SECURITY;

-- Company access policies
CREATE POLICY "Users can access their companies" ON companies
  FOR ALL USING (
    id IN (
      SELECT company_id FROM user_companies 
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Users can create companies" ON companies
  FOR INSERT WITH CHECK (true);

-- Studio access policies  
CREATE POLICY "Company members can access studios" ON studios
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies 
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

-- Workflow execution policies
CREATE POLICY "Studio members can access executions" ON workflow_executions
  FOR ALL USING (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

-- File access policies
CREATE POLICY "Studio members can access files" ON files
  FOR ALL USING (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

-- User profile policies
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (id = auth.uid());

-- User-company relationship policies
CREATE POLICY "Users can manage own company relationships" ON user_companies
  FOR ALL USING (user_id = auth.uid());

-- Analytics access policies
CREATE POLICY "Company members can view analytics" ON studio_analytics
  FOR SELECT USING (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

-- Kanban access policies
CREATE POLICY "Studio members can access kanban boards" ON kanban_boards
  FOR ALL USING (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

CREATE POLICY "Studio members can access kanban stages" ON kanban_stages
  FOR ALL USING (
    board_id IN (
      SELECT kb.id FROM kanban_boards kb
      JOIN studios s ON kb.studio_id = s.id
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

CREATE POLICY "Studio members can access kanban cards" ON kanban_cards
  FOR ALL USING (
    board_id IN (
      SELECT kb.id FROM kanban_boards kb
      JOIN studios s ON kb.studio_id = s.id
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

CREATE POLICY "Studio members can access card field definitions" ON card_field_definitions
  FOR ALL USING (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );
```

### Supabase Migration Files Structure (Simplified)
```
supabase/migrations/
├── 20241004000001_create_companies.sql
├── 20241004000002_create_users_and_relationships.sql  
├── 20241004000003_create_studios.sql
├── 20241004000004_create_workflow_templates.sql
├── 20241004000005_create_workflow_executions.sql
├── 20241004000006_create_files.sql
├── 20241004000007_create_kanban_boards.sql
├── 20241004000008_create_kanban_stages.sql
├── 20241004000009_create_kanban_cards.sql
├── 20241004000010_create_card_field_definitions.sql
├── 20241004000011_create_analytics_views.sql
├── 20241004000012_create_indexes.sql
└── 20241004000013_enable_rls_policies.sql
```

---

**Data Model Status**: ✅ Complete (CONSTITUTIONALLY COMPLIANT + KANBAN INTEGRATED)  
**Entities Defined**: 10 core tables + 1 analytics view (simplified per constitution)  
**SQL Schema**: Simplified with JSON fields, constraints, indexes, and RLS policies  
**Relationships**: Denormalized for simplicity, direct Supabase integration  
**Constitutional Compliance**: Minimal junction tables, real-time analytics, JSON hierarchies  
**Kanban Integration**: Full board/stage/card system with custom fields and workflow triggers  
**Next Phase**: API Contracts Generation