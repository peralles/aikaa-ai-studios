import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsObject,
  IsArray,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum KanbanStageType {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  TESTING = 'testing',
  DONE = 'done',
  ARCHIVED = 'archived',
  CUSTOM = 'custom',
}

export enum StageAutomation {
  NONE = 'none',
  AUTO_ASSIGN = 'auto_assign',
  WORKFLOW_TRIGGER = 'workflow_trigger',
  NOTIFICATION = 'notification',
  TIME_TRACKING = 'time_tracking',
}

export class KanbanStage {
  @ApiProperty({ 
    description: 'Unique kanban stage identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'Board identifier that owns this stage',
    format: 'uuid'
  })
  @IsUUID(4)
  board_id: string;

  @ApiProperty({ 
    description: 'Stage name',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Stage description',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ 
    description: 'Stage type/category',
    enum: KanbanStageType
  })
  @IsEnum(KanbanStageType)
  stage_type: KanbanStageType;

  @ApiProperty({ 
    description: 'Stage position order (0-based)',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiPropertyOptional({ 
    description: 'Stage color for UI display',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;

  @ApiPropertyOptional({ 
    description: 'Maximum number of cards allowed in this stage (WIP limit)',
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wip_limit?: number;

  @ApiProperty({ 
    description: 'Whether this stage is collapsed in the UI'
  })
  @IsBoolean()
  is_collapsed: boolean;

  @ApiProperty({ 
    description: 'Stage automation rules',
    enum: StageAutomation
  })
  @IsEnum(StageAutomation)
  automation: StageAutomation;

  @ApiPropertyOptional({ 
    description: 'Automation configuration for this stage',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  automation_config?: {
    workflow_template_id?: string;
    auto_assign_user_id?: string;
    notification_users?: string[];
    time_tracking_start?: boolean;
    time_tracking_stop?: boolean;
    custom_rules?: Record<string, any>;
  };

  @ApiPropertyOptional({ 
    description: 'Stage rules and policies',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  rules?: {
    require_assignee?: boolean;
    require_due_date?: boolean;
    require_description?: boolean;
    require_tags?: boolean;
    auto_archive_after_days?: number;
    prevent_move_back?: boolean;
  };

  @ApiProperty({ 
    description: 'User ID who created the stage',
    format: 'uuid'
  })
  @IsUUID(4)
  created_by: string;

  @ApiProperty({ 
    description: 'Stage creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({ 
    description: 'Stage last update timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  updated_at: string;
}

// DTO for creating a new kanban stage
export class CreateKanbanStageDto {
  @ApiProperty({ 
    description: 'Stage name',
    minLength: 1,
    maxLength: 50,
    example: 'Code Review'
  })
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Stage description',
    maxLength: 500,
    example: 'Cards undergoing peer code review'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ 
    description: 'Stage type/category',
    enum: KanbanStageType,
    example: KanbanStageType.REVIEW
  })
  @IsEnum(KanbanStageType)
  stage_type: KanbanStageType;

  @ApiProperty({ 
    description: 'Stage position order (0-based)',
    minimum: 0,
    example: 2
  })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiPropertyOptional({ 
    description: 'Stage color for UI display',
    maxLength: 20,
    example: '#f59e0b'
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;

  @ApiPropertyOptional({ 
    description: 'Maximum number of cards allowed (WIP limit)',
    minimum: 0,
    example: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wip_limit?: number;

  @ApiPropertyOptional({ 
    description: 'Stage automation rules',
    enum: StageAutomation,
    default: StageAutomation.NONE
  })
  @IsOptional()
  @IsEnum(StageAutomation)
  automation?: StageAutomation;

  @ApiPropertyOptional({ 
    description: 'Automation configuration for this stage',
    type: 'object',
    additionalProperties: true,
    example: {
      workflow_template_id: 'uuid',
      notification_users: ['user1', 'user2'],
      time_tracking_start: true
    }
  })
  @IsOptional()
  @IsObject()
  automation_config?: {
    workflow_template_id?: string;
    auto_assign_user_id?: string;
    notification_users?: string[];
    time_tracking_start?: boolean;
    time_tracking_stop?: boolean;
    custom_rules?: Record<string, any>;
  };

  @ApiPropertyOptional({ 
    description: 'Stage rules and policies',
    type: 'object',
    additionalProperties: true,
    example: {
      require_assignee: true,
      require_due_date: false,
      auto_archive_after_days: 30
    }
  })
  @IsOptional()
  @IsObject()
  rules?: {
    require_assignee?: boolean;
    require_due_date?: boolean;
    require_description?: boolean;
    require_tags?: boolean;
    auto_archive_after_days?: number;
    prevent_move_back?: boolean;
  };
}

// DTO for updating kanban stage
export class UpdateKanbanStageDto {
  @ApiPropertyOptional({ 
    description: 'Stage name',
    minLength: 1,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Stage description',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Stage type/category',
    enum: KanbanStageType
  })
  @IsOptional()
  @IsEnum(KanbanStageType)
  stage_type?: KanbanStageType;

  @ApiPropertyOptional({ 
    description: 'Stage position order (0-based)',
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ 
    description: 'Stage color for UI display',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;

  @ApiPropertyOptional({ 
    description: 'Maximum number of cards allowed (WIP limit)',
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wip_limit?: number;

  @ApiPropertyOptional({ 
    description: 'Whether this stage is collapsed in the UI'
  })
  @IsOptional()
  @IsBoolean()
  is_collapsed?: boolean;

  @ApiPropertyOptional({ 
    description: 'Stage automation rules',
    enum: StageAutomation
  })
  @IsOptional()
  @IsEnum(StageAutomation)
  automation?: StageAutomation;

  @ApiPropertyOptional({ 
    description: 'Automation configuration for this stage',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  automation_config?: {
    workflow_template_id?: string;
    auto_assign_user_id?: string;
    notification_users?: string[];
    time_tracking_start?: boolean;
    time_tracking_stop?: boolean;
    custom_rules?: Record<string, any>;
  };

  @ApiPropertyOptional({ 
    description: 'Stage rules and policies',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  rules?: {
    require_assignee?: boolean;
    require_due_date?: boolean;
    require_description?: boolean;
    require_tags?: boolean;
    auto_archive_after_days?: number;
    prevent_move_back?: boolean;
  };
}

// DTO for reordering stages
export class ReorderStagesDto {
  @ApiProperty({ 
    description: 'Array of stage IDs in new order',
    type: 'array',
    items: { type: 'string', format: 'uuid' }
  })
  @IsArray()
  @IsUUID(4, { each: true })
  stage_order: string[];
}

// Extended stage with additional details
export class KanbanStageWithDetails extends KanbanStage {
  @ApiPropertyOptional({ 
    description: 'Board details',
    type: 'object',
    properties: {
      name: { type: 'string' },
      visibility: { type: 'string' },
    },
  })
  board?: {
    name: string;
    visibility: string;
  };

  @ApiPropertyOptional({ 
    description: 'Stage statistics'
  })
  stats?: {
    card_count: number;
    avg_card_duration_days: number;
    overdue_cards: number;
    wip_limit_exceeded: boolean;
  };

  @ApiPropertyOptional({ 
    description: 'Cards currently in this stage'
  })
  cards?: Array<{
    id: string;
    title: string;
    assignee_name?: string;
    due_date?: string;
    priority?: string;
  }>;
}

// Stage analytics and performance metrics
export class KanbanStageAnalytics {
  @ApiProperty({ description: 'Stage identifier', format: 'uuid' })
  stage_id: string;

  @ApiProperty({ description: 'Stage name' })
  stage_name: string;

  @ApiProperty({ description: 'Stage type' })
  stage_type: KanbanStageType;

  @ApiProperty({ description: 'Current card count' })
  current_card_count: number;

  @ApiProperty({ description: 'WIP limit if set' })
  wip_limit?: number;

  @ApiProperty({ description: 'Whether WIP limit is exceeded' })
  wip_limit_exceeded: boolean;

  @ApiProperty({ description: 'Average time cards spend in this stage (days)' })
  avg_duration_days: number;

  @ApiProperty({ description: 'Total cards that passed through this stage' })
  total_cards_processed: number;

  @ApiProperty({ description: 'Cards moved in this week' })
  cards_moved_in_week: number;

  @ApiProperty({ description: 'Cards moved out this week' })
  cards_moved_out_week: number;

  @ApiProperty({ description: 'Stage throughput (cards/week)' })
  throughput_weekly: number;

  @ApiProperty({ description: 'Bottleneck indicator (true if slowest stage)' })
  is_bottleneck: boolean;

  @ApiProperty({ description: 'Most common card types in this stage' })
  common_card_types: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Automation execution statistics' })
  automation_stats?: {
    total_triggers: number;
    successful_executions: number;
    failed_executions: number;
    last_execution_at?: string;
  };
}