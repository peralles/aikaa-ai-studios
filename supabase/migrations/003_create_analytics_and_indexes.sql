-- Studios AI Backend Platform - Analytics Views and Performance Indexes  
-- Migration: 003_create_analytics_and_indexes
-- Date: 2025-10-04
-- Description: Create real-time analytics views and performance indexes

-- Real-time analytics view (no separate analytics table per constitutional requirements)
CREATE VIEW studio_analytics AS
SELECT 
  s.id as studio_id,
  s.name as studio_name,
  s.company_id,
  s.business_area,
  COUNT(we.id) as total_executions,
  COUNT(CASE WHEN we.status = 'succeeded' THEN 1 END) as successful_executions,
  COUNT(CASE WHEN we.status = 'failed' THEN 1 END) as failed_executions,
  COUNT(CASE WHEN we.status = 'running' THEN 1 END) as running_executions,
  COUNT(CASE WHEN we.status = 'pending' THEN 1 END) as pending_executions,
  ROUND(AVG(we.duration_seconds), 2) as avg_duration_seconds,
  COUNT(DISTINCT we.user_id) as unique_users,
  COUNT(f.id) as files_uploaded,
  COALESCE(SUM(f.file_size), 0) as storage_used_bytes,
  MAX(we.completed_at) as last_execution_at,
  COUNT(kb.id) as kanban_boards_count,
  COUNT(kc.id) as kanban_cards_count,
  s.created_at as studio_created_at
FROM studios s
LEFT JOIN workflow_executions we ON s.id = we.studio_id
LEFT JOIN files f ON s.id = f.studio_id  
LEFT JOIN kanban_boards kb ON s.id = kb.studio_id
LEFT JOIN kanban_cards kc ON kb.id = kc.board_id
GROUP BY s.id, s.name, s.company_id, s.business_area, s.created_at;

-- Company-level analytics view
CREATE VIEW company_analytics AS
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.industry_type,
  COUNT(DISTINCT s.id) as studios_count,
  COUNT(DISTINCT uc.user_id) as active_users_count,
  COUNT(we.id) as total_executions,
  COUNT(CASE WHEN we.status = 'succeeded' THEN 1 END) as successful_executions,
  ROUND(AVG(we.duration_seconds), 2) as avg_execution_duration,
  COUNT(f.id) as total_files,
  COALESCE(SUM(f.file_size), 0) as total_storage_used,
  COUNT(kb.id) as total_kanban_boards,
  COUNT(kc.id) as total_kanban_cards,
  c.created_at as company_created_at
FROM companies c
LEFT JOIN studios s ON c.id = s.company_id
LEFT JOIN user_companies uc ON c.id = uc.company_id AND uc.status = 'approved'
LEFT JOIN workflow_executions we ON s.id = we.studio_id
LEFT JOIN files f ON s.id = f.studio_id
LEFT JOIN kanban_boards kb ON s.id = kb.studio_id  
LEFT JOIN kanban_cards kc ON kb.id = kc.board_id
GROUP BY c.id, c.name, c.industry_type, c.created_at;

-- Workflow template usage analytics
CREATE VIEW workflow_template_analytics AS
SELECT 
  wt.id as template_id,
  wt.name as template_name,
  wt.business_area,
  wt.complexity_level,
  COUNT(we.id) as total_executions,
  COUNT(CASE WHEN we.status = 'succeeded' THEN 1 END) as successful_executions,
  COUNT(CASE WHEN we.status = 'failed' THEN 1 END) as failed_executions,
  ROUND(AVG(we.duration_seconds), 2) as avg_duration_seconds,
  COUNT(DISTINCT we.studio_id) as unique_studios_used,
  COUNT(DISTINCT we.user_id) as unique_users,
  MAX(we.completed_at) as last_used_at,
  wt.estimated_duration_minutes,
  wt.created_at as template_created_at
FROM workflow_templates wt
LEFT JOIN workflow_executions we ON wt.id = we.template_id
WHERE wt.is_active = true
GROUP BY wt.id, wt.name, wt.business_area, wt.complexity_level, wt.estimated_duration_minutes, wt.created_at;

-- Performance Indexes
-- User access patterns
CREATE INDEX idx_user_companies_user_id ON user_companies(user_id) WHERE status = 'approved';
CREATE INDEX idx_user_companies_company_id ON user_companies(company_id) WHERE status = 'approved';

-- Studio and execution queries
CREATE INDEX idx_studios_company_id ON studios(company_id);
CREATE INDEX idx_studios_business_area ON studios(business_area);
CREATE INDEX idx_workflow_executions_studio_id ON workflow_executions(studio_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_created_at ON workflow_executions(created_at DESC);
CREATE INDEX idx_workflow_executions_template_id ON workflow_executions(template_id);
CREATE INDEX idx_workflow_executions_user_id ON workflow_executions(user_id);

-- File management indexes
CREATE INDEX idx_files_studio_id ON files(studio_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_upload_timestamp ON files(upload_timestamp DESC);
CREATE INDEX idx_files_access_level ON files(access_level);
CREATE INDEX idx_files_mime_type ON files(mime_type);

-- Kanban management indexes
CREATE INDEX idx_kanban_boards_studio_id ON kanban_boards(studio_id);
CREATE INDEX idx_kanban_stages_board_id ON kanban_stages(board_id);
CREATE INDEX idx_kanban_stages_position ON kanban_stages(board_id, position);
CREATE INDEX idx_kanban_cards_board_id ON kanban_cards(board_id);
CREATE INDEX idx_kanban_cards_stage_id ON kanban_cards(stage_id);
CREATE INDEX idx_kanban_cards_position ON kanban_cards(stage_id, position);
CREATE INDEX idx_kanban_cards_assignee ON kanban_cards(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX idx_kanban_cards_due_date ON kanban_cards(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_card_field_definitions_studio ON card_field_definitions(studio_id, display_order);

-- Template discovery indexes
CREATE INDEX idx_workflow_templates_business_area ON workflow_templates(business_area) WHERE is_active = true;
CREATE INDEX idx_workflow_templates_complexity ON workflow_templates(complexity_level) WHERE is_active = true;
CREATE INDEX idx_workflow_templates_tags ON workflow_templates USING GIN(tags) WHERE is_active = true;

-- Company and user lookup indexes
CREATE INDEX idx_companies_industry_type ON companies(industry_type);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_workflow_executions_studio_status ON workflow_executions(studio_id, status);
CREATE INDEX idx_workflow_executions_template_status ON workflow_executions(template_id, status);
CREATE INDEX idx_files_studio_access ON files(studio_id, access_level);
CREATE INDEX idx_kanban_cards_stage_position ON kanban_cards(stage_id, position);

-- JSON field indexes for custom fields and metadata
CREATE INDEX idx_kanban_cards_custom_fields ON kanban_cards USING GIN(custom_fields);
CREATE INDEX idx_workflow_executions_input_data ON workflow_executions USING GIN(input_data);
CREATE INDEX idx_workflow_executions_logs ON workflow_executions USING GIN(logs);
CREATE INDEX idx_files_metadata ON files USING GIN(metadata);
CREATE INDEX idx_kanban_stages_workflow_triggers ON kanban_stages USING GIN(workflow_triggers);

-- Add RLS policies for analytics views
ALTER TABLE studio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_analytics ENABLE ROW LEVEL SECURITY; 
ALTER TABLE workflow_template_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics view access policies
CREATE POLICY "Company members can view studio analytics" ON studio_analytics
  FOR SELECT USING (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

CREATE POLICY "Company members can view company analytics" ON company_analytics
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_companies
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Anyone can view workflow template analytics" ON workflow_template_analytics
  FOR SELECT USING (true);

-- Create helper functions for analytics calculations
CREATE OR REPLACE FUNCTION get_studio_success_rate(studio_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_executions INTEGER;
  successful_executions INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN status = 'succeeded' THEN 1 END)
  INTO total_executions, successful_executions
  FROM workflow_executions 
  WHERE studio_id = studio_uuid;
  
  IF total_executions = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((successful_executions::DECIMAL / total_executions) * 100, 2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_template_popularity_score(template_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  usage_count INTEGER;
  unique_studios INTEGER;
  success_rate DECIMAL;
  recency_factor DECIMAL;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(DISTINCT studio_id),
    COALESCE(AVG(CASE WHEN status = 'succeeded' THEN 1.0 ELSE 0.0 END), 0),
    CASE 
      WHEN MAX(created_at) > NOW() - INTERVAL '30 days' THEN 1.0
      WHEN MAX(created_at) > NOW() - INTERVAL '90 days' THEN 0.7
      ELSE 0.3
    END
  INTO usage_count, unique_studios, success_rate, recency_factor
  FROM workflow_executions 
  WHERE template_id = template_uuid;
  
  RETURN ROUND((usage_count * 0.3 + unique_studios * 0.4 + success_rate * 20 + recency_factor * 10), 2);
END;
$$ LANGUAGE plpgsql;

-- Comments for analytics documentation
COMMENT ON VIEW studio_analytics IS 'Real-time analytics for studio performance and usage metrics';
COMMENT ON VIEW company_analytics IS 'Company-level aggregated metrics across all studios';
COMMENT ON VIEW workflow_template_analytics IS 'Usage and performance analytics for workflow templates';
COMMENT ON FUNCTION get_studio_success_rate(UUID) IS 'Calculate success rate percentage for a studio';
COMMENT ON FUNCTION get_template_popularity_score(UUID) IS 'Calculate popularity score based on usage, success rate, and recency';