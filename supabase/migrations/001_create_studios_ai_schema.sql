-- Studios AI Backend Platform - Complete Database Schema
-- Migration: 001_create_studios_ai_schema
-- Date: 2025-10-04
-- Description: Create all core tables for the Studios AI platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table (simplified with branches as JSON)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL CHECK (length(name) >= 3),
  industry_type VARCHAR(50) NOT NULL CHECK (industry_type IN ('technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'education', 'consulting', 'other')),
  contact_email VARCHAR(255) NOT NULL CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  contact_phone VARCHAR(20),
  headquarters_address VARCHAR(500) NOT NULL CHECK (length(headquarters_address) >= 10),
  branches JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL CHECK (length(full_name) >= 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create user-company junction table
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

-- Create studios table
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

-- Create workflow templates table
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

-- Create workflow executions table (simplified with files as JSON)
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
  logs JSONB DEFAULT '[]'::jsonb,
  files_used JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
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
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create kanban boards table
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

-- Create kanban stages table
CREATE TABLE kanban_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL CHECK (length(name) >= 2),
  color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  position INTEGER NOT NULL CHECK (position >= 0),
  workflow_triggers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, name),
  UNIQUE(board_id, position)
);

-- Create kanban cards table
CREATE TABLE kanban_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES kanban_stages(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL CHECK (length(title) >= 1),
  description TEXT,
  position INTEGER NOT NULL CHECK (position >= 0),
  assignee_id UUID REFERENCES user_profiles(id),
  due_date TIMESTAMP WITH TIME ZONE,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stage_id, position)
);

-- Create card field definitions table
CREATE TABLE card_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  field_name VARCHAR(50) NOT NULL CHECK (length(field_name) >= 1),
  field_type VARCHAR(20) NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'dropdown', 'checkbox')),
  field_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL CHECK (display_order >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(studio_id, field_name),
  UNIQUE(studio_id, display_order)
);

-- Create trigger function to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studios_updated_at 
  BEFORE UPDATE ON studios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at 
  BEFORE UPDATE ON workflow_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_boards_updated_at 
  BEFORE UPDATE ON kanban_boards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_stages_updated_at 
  BEFORE UPDATE ON kanban_stages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_cards_updated_at 
  BEFORE UPDATE ON kanban_cards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE companies IS 'Business organizations with hierarchical structure';
COMMENT ON TABLE user_profiles IS 'Business team members extending Supabase auth.users';
COMMENT ON TABLE user_companies IS 'Many-to-many relationship between users and companies with roles';
COMMENT ON TABLE studios IS 'Specialized automation workspaces within companies';
COMMENT ON TABLE workflow_templates IS 'Pre-built automation process definitions';
COMMENT ON TABLE workflow_executions IS 'Workflow run instances with tracking';
COMMENT ON TABLE files IS 'User-uploaded documents and data files';
COMMENT ON TABLE kanban_boards IS 'Visual project management tools within studios';
COMMENT ON TABLE kanban_stages IS 'Customizable workflow steps in Kanban boards';
COMMENT ON TABLE kanban_cards IS 'Individual tasks with custom fields';
COMMENT ON TABLE card_field_definitions IS 'Studio-level configuration for custom card fields';