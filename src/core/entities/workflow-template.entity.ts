import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum WorkflowTemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
}

export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULE = 'schedule',
  WEBHOOK = 'webhook',
  FILE_UPLOAD = 'file_upload',
  KANBAN_CARD_CREATE = 'kanban_card_create',
  KANBAN_CARD_UPDATE = 'kanban_card_update',
  KANBAN_STAGE_CHANGE = 'kanban_stage_change',
}

export class WorkflowTrigger {
  @ApiProperty({ 
    description: 'Trigger type',
    enum: TriggerType
  })
  @IsEnum(TriggerType)
  type: TriggerType;

  @ApiPropertyOptional({ 
    description: 'Trigger configuration (schedule cron, webhook settings, etc.)',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Trigger conditions/filters',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;
}

export class WorkflowStep {
  @ApiProperty({ 
    description: 'Step identifier within workflow'
  })
  @IsString()
  id: string;

  @ApiProperty({ 
    description: 'ActivePieces action type'
  })
  @IsString()
  action_type: string;

  @ApiProperty({ 
    description: 'Step display name'
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Step description'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ 
    description: 'Step configuration parameters',
    type: 'object',
    additionalProperties: true
  })
  @IsObject()
  config: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Next steps to execute (for branching)',
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  next_steps?: string[];

  @ApiPropertyOptional({ 
    description: 'Error handling configuration',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  error_handling?: Record<string, any>;
}

export class WorkflowTemplate {
  @ApiProperty({ 
    description: 'Unique workflow template identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'Studio identifier that owns this template',
    format: 'uuid'
  })
  @IsUUID(4)
  studio_id: string;

  @ApiProperty({ 
    description: 'Template name',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Template description',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ 
    description: 'Template status',
    enum: WorkflowTemplateStatus
  })
  @IsEnum(WorkflowTemplateStatus)
  status: WorkflowTemplateStatus;

  @ApiProperty({ 
    description: 'Workflow trigger configuration',
    type: WorkflowTrigger
  })
  @ValidateNested()
  @Type(() => WorkflowTrigger)
  trigger: WorkflowTrigger;

  @ApiProperty({ 
    description: 'Workflow steps sequence',
    type: [WorkflowStep]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStep)
  steps: WorkflowStep[];

  @ApiPropertyOptional({ 
    description: 'Template variables for parameterization',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Template tags for categorization',
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    description: 'Whether template is public/shareable'
  })
  @IsBoolean()
  is_public: boolean;

  @ApiProperty({ 
    description: 'User ID who created the template',
    format: 'uuid'
  })
  @IsUUID(4)
  created_by: string;

  @ApiProperty({ 
    description: 'Template creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({ 
    description: 'Template last update timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  updated_at: string;
}

// DTO for creating a new workflow template
export class CreateWorkflowTemplateDto {
  @ApiProperty({ 
    description: 'Template name',
    minLength: 3,
    maxLength: 100,
    example: 'Customer Onboarding Flow'
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Template description',
    maxLength: 1000,
    example: 'Automated workflow for new customer onboarding process'
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ 
    description: 'Workflow trigger configuration',
    type: WorkflowTrigger,
    example: {
      type: 'manual',
      config: {},
      conditions: {}
    }
  })
  @ValidateNested()
  @Type(() => WorkflowTrigger)
  trigger: WorkflowTrigger;

  @ApiProperty({ 
    description: 'Workflow steps sequence',
    type: [WorkflowStep],
    example: [{
      id: 'step1',
      action_type: 'send_email',
      name: 'Welcome Email',
      description: 'Send welcome email to new customer',
      config: {
        to: '{{customer.email}}',
        subject: 'Welcome to our platform!',
        template: 'welcome_template'
      }
    }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStep)
  steps: WorkflowStep[];

  @ApiPropertyOptional({ 
    description: 'Template variables for parameterization',
    type: 'object',
    additionalProperties: true,
    example: {
      company_name: { type: 'string', required: true },
      welcome_message: { type: 'text', default: 'Welcome aboard!' }
    }
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Template tags for categorization',
    type: 'array',
    items: { type: 'string' },
    example: ['onboarding', 'customer', 'automation']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether template is public/shareable',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}

// DTO for updating workflow template
export class UpdateWorkflowTemplateDto {
  @ApiPropertyOptional({ 
    description: 'Template name',
    minLength: 3,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Template description',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Template status',
    enum: WorkflowTemplateStatus
  })
  @IsOptional()
  @IsEnum(WorkflowTemplateStatus)
  status?: WorkflowTemplateStatus;

  @ApiPropertyOptional({ 
    description: 'Workflow trigger configuration',
    type: WorkflowTrigger
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowTrigger)
  trigger?: WorkflowTrigger;

  @ApiPropertyOptional({ 
    description: 'Workflow steps sequence',
    type: [WorkflowStep]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStep)
  steps?: WorkflowStep[];

  @ApiPropertyOptional({ 
    description: 'Template variables for parameterization',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Template tags for categorization',
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether template is public/shareable'
  })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}

// Extended template with additional details
export class WorkflowTemplateWithDetails extends WorkflowTemplate {
  @ApiPropertyOptional({ 
    description: 'Studio details',
    type: 'object',
    properties: {
      name: { type: 'string' },
      business_area: { type: 'string' },
    },
  })
  studio?: {
    name: string;
    business_area: string;
  };

  @ApiPropertyOptional({ 
    description: 'Creator details',
    type: 'object',
    properties: {
      full_name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  })
  creator?: {
    full_name: string;
    email: string;
  };

  @ApiPropertyOptional({ 
    description: 'Execution statistics'
  })
  execution_stats?: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    avg_duration_seconds: number;
    last_execution_at?: string;
  };
}

// Template analytics
export class WorkflowTemplateAnalytics {
  @ApiProperty({ description: 'Template identifier', format: 'uuid' })
  template_id: string;

  @ApiProperty({ description: 'Template name' })
  template_name: string;

  @ApiProperty({ description: 'Total executions' })
  total_executions: number;

  @ApiProperty({ description: 'Successful executions' })
  successful_executions: number;

  @ApiProperty({ description: 'Failed executions' })
  failed_executions: number;

  @ApiProperty({ description: 'Success rate percentage' })
  success_rate: number;

  @ApiProperty({ description: 'Average execution duration in seconds' })
  avg_duration_seconds: number;

  @ApiProperty({ description: 'Most common failure reasons' })
  common_errors: Array<{
    error_type: string;
    count: number;
    percentage: number;
  }>;

  @ApiPropertyOptional({ 
    description: 'Last execution timestamp',
    format: 'date-time'
  })
  last_execution_at?: string;

  @ApiProperty({ description: 'Usage trend over time' })
  usage_trend: Array<{
    date: string;
    executions: number;
    success_rate: number;
  }>;
}