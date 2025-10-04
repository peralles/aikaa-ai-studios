-- Studios AI Backend Platform - Row Level Security Policies
-- Migration: 002_enable_rls_policies
-- Date: 2025-10-04
-- Description: Enable RLS and create company-based data isolation policies

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_field_definitions ENABLE ROW LEVEL SECURITY;

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

-- User profile policies
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Users can view other profiles in same company" ON user_profiles
  FOR SELECT USING (
    id IN (
      SELECT uc1.user_id FROM user_companies uc1
      JOIN user_companies uc2 ON uc1.company_id = uc2.company_id
      WHERE uc2.user_id = auth.uid() AND uc1.status = 'approved' AND uc2.status = 'approved'
    )
  );

-- User-company relationship policies
CREATE POLICY "Users can manage own company relationships" ON user_companies
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Company admins can manage member relationships" ON user_companies
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'approved'
    )
  );

-- Studio access policies  
CREATE POLICY "Company members can access studios" ON studios
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_companies 
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

-- Workflow template policies (public read, admin write)
CREATE POLICY "Anyone can view active workflow templates" ON workflow_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "System admins can manage workflow templates" ON workflow_templates
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE id = auth.uid()
      -- Add admin role check here when implementing system-wide admin roles
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

CREATE POLICY "Users can access their own private files" ON files
  FOR ALL USING (
    access_level = 'private' AND uploaded_by = auth.uid()
  );

CREATE POLICY "Company members can access company-level files" ON files
  FOR SELECT USING (
    access_level = 'company' AND studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

-- Kanban board access policies
CREATE POLICY "Studio members can access kanban boards" ON kanban_boards
  FOR ALL USING (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

-- Kanban stage access policies
CREATE POLICY "Studio members can access kanban stages" ON kanban_stages
  FOR ALL USING (
    board_id IN (
      SELECT kb.id FROM kanban_boards kb
      JOIN studios s ON kb.studio_id = s.id
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

-- Kanban card access policies
CREATE POLICY "Studio members can access kanban cards" ON kanban_cards
  FOR ALL USING (
    board_id IN (
      SELECT kb.id FROM kanban_boards kb
      JOIN studios s ON kb.studio_id = s.id
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

-- Card field definition access policies
CREATE POLICY "Studio members can access card field definitions" ON card_field_definitions
  FOR ALL USING (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

-- Insert policies for creating new records
CREATE POLICY "Approved company members can create studios" ON studios
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_companies
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

CREATE POLICY "Approved studio members can create executions" ON workflow_executions
  FOR INSERT WITH CHECK (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

CREATE POLICY "Approved studio members can upload files" ON files
  FOR INSERT WITH CHECK (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

CREATE POLICY "Approved studio members can create kanban boards" ON kanban_boards
  FOR INSERT WITH CHECK (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

CREATE POLICY "Approved studio members can create kanban stages" ON kanban_stages
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT kb.id FROM kanban_boards kb
      JOIN studios s ON kb.studio_id = s.id
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

CREATE POLICY "Approved studio members can create kanban cards" ON kanban_cards
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT kb.id FROM kanban_boards kb
      JOIN studios s ON kb.studio_id = s.id
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

CREATE POLICY "Approved studio members can create card field definitions" ON card_field_definitions
  FOR INSERT WITH CHECK (
    studio_id IN (
      SELECT s.id FROM studios s
      JOIN user_companies uc ON s.company_id = uc.company_id
      WHERE uc.user_id = auth.uid() AND uc.status = 'approved'
    )
  );

-- Comments for RLS documentation
COMMENT ON POLICY "Users can access their companies" ON companies IS 'Company-based data isolation - users can only access companies they are approved members of';
COMMENT ON POLICY "Users can manage own profile" ON user_profiles IS 'Users can only modify their own profile data';
COMMENT ON POLICY "Studio members can access kanban cards" ON kanban_cards IS 'Kanban cards are accessible only to studio members through company membership';
COMMENT ON POLICY "Approved studio members can create executions" ON workflow_executions IS 'Only approved company members can execute workflows in their studios';