# Feature Specification: Studios AI Backend Platform

**Feature Branch**: `001-build-studios-ai`  
**Created**: 2025-10-04  
**Status**: Draft  
**Input**: User description: "Build Studios AI, a comprehensive backend platform that enables businesses to create and manage AI-powered automation studios. The platform should allow users to register their companies (it can be headquarter and branches), create multiple studios within their each company, and execute pre-built automation workflows to solve common business problems."

## Clarifications

### Session 2025-10-04
- Q: How should user registration and company access work? → A: Users can either create new companies or request to join existing ones with approval
- Q: How should user roles and studio access permissions work? → A: All company members can access all studios within their company
- Q: What execution limits should apply to workflow runs? → A: Usage-based limits tied to company subscription tiers or plans
- Q: How should data retention and file storage limits work? → A: Storage quotas per company with manual cleanup options
- Q: How should workflow failure recovery work? → A: Automatic retry with exponential backoff for transient failures

### Session 2025-10-04 (Kanban Integration)
- Q: How should Kanban boards be scoped within the platform hierarchy? → A: Multiple Kanban boards per Studio (studios can have many boards)
- Q: What generic attributes should Kanban cards support for workflow triggering? → A: Configurable custom fields (text, number, date, dropdown, checkbox)
- Q: How should stage transitions and attribute changes trigger ActivePieces workflows? → A: Combined triggers (stage + attribute conditions like "moved to Done AND priority = High")
- Q: How should Kanban events integrate with ActivePieces workflow execution? → A: Direct webhook calls to ActivePieces on every card change
- Q: How configurable should the Kanban system be for different studio workflows? → A: Studio-level stage customization (each studio defines its own stages)

## User Scenarios & Testing

### Primary User Story
A business administrator registers their company and creates specialized automation studios for different departments (marketing, sales, operations). Team members create Kanban boards within studios to manage their projects and tasks. They configure custom stages and card attributes that automatically trigger pre-built workflows when cards move between stages or when specific attributes change. As team members work with their Kanban boards, the system automatically executes relevant automation workflows, monitors progress, and provides insights into both project management and automation effectiveness across their organization.

### Acceptance Scenarios
1. **Given** a new business user visits the platform, **When** they register their company with basic information, **Then** they can access the platform and create their first studio
2. **Given** a company is registered, **When** an administrator creates a new studio for a specific business area, **Then** team members can access that studio and create Kanban boards
3. **Given** a user is in a studio, **When** they create a Kanban board with custom stages and card fields, **Then** they can add cards and configure workflow triggers
4. **Given** a Kanban card exists, **When** a user moves it to a different stage or changes a custom field value, **Then** the system automatically triggers the associated workflow
5. **Given** a workflow is running from a Kanban trigger, **When** a user checks the execution status, **Then** they can see real-time progress, logs, and final outcomes
6. **Given** multiple workflows have been executed from Kanban events, **When** a user views analytics, **Then** they can see usage patterns and business impact metrics

### Edge Cases
- What happens when a workflow execution fails due to invalid input data or external service errors?
- How does the system handle concurrent workflow executions within the same studio?
- What occurs when a user tries to access a studio they don't have permissions for?
- How are file uploads handled when they exceed size limits or contain unsupported formats?

## Requirements

### Functional Requirements
- **FR-001**: System MUST allow users to register and create new companies with company name, industry type, and contact details
- **FR-002**: System MUST allow users to request to join existing companies with administrator approval
- **FR-003**: System MUST support company hierarchies with headquarters and branch locations
- **FR-004**: System MUST enable creation of multiple studios per company, each focused on specific business areas
- **FR-005**: System MUST allow all company members to access all studios within their company
- **FR-006**: System MUST provide a catalog of pre-built automation workflows that users can browse and understand
- **FR-007**: System MUST allow users to select workflows and provide business-specific input data for execution
- **FR-008**: System MUST execute automation workflows using AI agents and return results to update core entities
- **FR-009**: System MUST provide real-time monitoring of workflow executions with success/failure status
- **FR-010**: System MUST generate detailed execution logs accessible when workflows fail or need debugging
- **FR-011**: System MUST implement automatic retry with exponential backoff for transient workflow failures
- **FR-012**: System MUST display business insights and analytics from workflow outputs
- **FR-013**: System MUST track usage analytics across all studios to measure automation value and impact
- **FR-014**: System MUST provide secure file upload, organization, and sharing capabilities within studios
- **FR-015**: System MUST handle multiple file types and provide access controls for team collaboration
- **FR-016**: System MUST enforce storage quotas per company and provide manual cleanup options for files and workflow data
- **FR-017**: System MUST authenticate users and restrict access to their organization's data only
- **FR-018**: System MUST implement rate limiting to prevent abuse of workflow execution resources
- **FR-019**: System MUST enforce usage-based limits on workflow executions tied to company subscription tiers
- **FR-020**: System MUST validate all user inputs to ensure data integrity and security
- **FR-021**: System MUST allow studios to create multiple Kanban boards for project and task management
- **FR-022**: System MUST enable studio-level customization of Kanban board stages (names, colors, order)
- **FR-023**: System MUST support Kanban cards with configurable custom fields (text, number, date, dropdown, checkbox)
- **FR-024**: System MUST trigger workflow executions based on combined stage transitions and attribute changes
- **FR-025**: System MUST send real-time webhook calls to ActivePieces when Kanban card events occur
- **FR-026**: System MUST provide real-time updates to Kanban boards for all connected studio members
- **FR-027**: System MUST enforce access controls so only studio members can view and modify their Kanban boards

### Key Entities
- **Company**: Represents a business organization with name, industry type, contact details, and hierarchical structure (headquarters/branches)
- **Studio**: Specialized automation workspace within a company, focused on specific business areas (marketing, sales, operations, customer support)
- **Workflow**: Pre-built automation process that solves common business problems, contains description, required inputs, and execution logic
- **Workflow Execution**: Instance of a workflow run with specific input data, tracks status, logs, results, and execution time
- **User**: Business team member with role-based access to studios and workflow execution capabilities
- **File**: Documents, images, or data files uploaded by users for workflow processing, with secure access controls
- **Analytics**: Usage metrics and business impact data generated from workflow executions across studios
- **Kanban Board**: Visual project management tool within a studio with customizable stages for organizing tasks and triggering workflows
- **Kanban Stage**: Customizable workflow step (e.g., "Backlog", "In Progress", "Review", "Done") with studio-defined names and properties
- **Kanban Card**: Individual task or work item with configurable custom fields that can trigger workflows when moved between stages or when attributes change
- **Card Custom Field**: Configurable attribute on Kanban cards (text, number, date, dropdown, checkbox) used for workflow trigger conditions

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
