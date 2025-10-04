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

export enum KanbanCardPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum KanbanCardStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum CardType {
  TASK = 'task',
  BUG = 'bug',
  FEATURE = 'feature',
  STORY = 'story',
  EPIC = 'epic',
  SPIKE = 'spike',
  IMPROVEMENT = 'improvement',
  CUSTOM = 'custom',
}

export class KanbanCard {
  @ApiProperty({ 
    description: 'Unique kanban card identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'Board identifier that owns this card',
    format: 'uuid'
  })
  @IsUUID(4)
  board_id: string;

  @ApiProperty({ 
    description: 'Stage identifier where card is currently located',
    format: 'uuid'
  })
  @IsUUID(4)
  stage_id: string;

  @ApiProperty({ 
    description: 'Card title',
    minLength: 1,
    maxLength: 200
  })
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiPropertyOptional({ 
    description: 'Card detailed description',
    maxLength: 5000
  })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @ApiProperty({ 
    description: 'Card type/category',
    enum: CardType
  })
  @IsEnum(CardType)
  card_type: CardType;

  @ApiProperty({ 
    description: 'Card priority level',
    enum: KanbanCardPriority
  })
  @IsEnum(KanbanCardPriority)
  priority: KanbanCardPriority;

  @ApiProperty({ 
    description: 'Card status',
    enum: KanbanCardStatus
  })
  @IsEnum(KanbanCardStatus)
  status: KanbanCardStatus;

  @ApiProperty({ 
    description: 'Card position within stage (0-based)'
  })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiPropertyOptional({ 
    description: 'User assigned to this card',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID(4)
  assigned_to?: string;

  @ApiPropertyOptional({ 
    description: 'Card due date',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ 
    description: 'Estimated effort in hours'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_hours?: number;

  @ApiPropertyOptional({ 
    description: 'Actual time spent in hours'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actual_hours?: number;

  @ApiPropertyOptional({ 
    description: 'Card tags for categorization',
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Card color for UI display',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;

  @ApiPropertyOptional({ 
    description: 'Custom field values',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Card attachments (file IDs)',
    type: 'array',
    items: { type: 'string', format: 'uuid' }
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  attachments?: string[];

  @ApiPropertyOptional({ 
    description: 'Checklist items',
    type: 'array'
  })
  @IsOptional()
  @IsArray()
  checklist?: Array<{
    id: string;
    text: string;
    completed: boolean;
    completed_by?: string;
    completed_at?: string;
  }>;

  @ApiPropertyOptional({ 
    description: 'Card dependencies (other card IDs)',
    type: 'array',
    items: { type: 'string', format: 'uuid' }
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  dependencies?: string[];

  @ApiPropertyOptional({ 
    description: 'Cards that depend on this card',
    type: 'array',
    items: { type: 'string', format: 'uuid' }
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  dependents?: string[];

  @ApiProperty({ 
    description: 'Whether card is blocked'
  })
  @IsBoolean()
  is_blocked: boolean;

  @ApiPropertyOptional({ 
    description: 'Reason why card is blocked'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  blocked_reason?: string;

  @ApiPropertyOptional({ 
    description: 'Workflow execution triggered by this card',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID(4)
  workflow_execution_id?: string;

  @ApiProperty({ 
    description: 'User ID who created the card',
    format: 'uuid'
  })
  @IsUUID(4)
  created_by: string;

  @ApiProperty({ 
    description: 'Card creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({ 
    description: 'Card last update timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  updated_at: string;

  @ApiPropertyOptional({ 
    description: 'Card completion timestamp',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  completed_at?: string;
}

// DTO for creating a new kanban card
export class CreateKanbanCardDto {
  @ApiProperty({ 
    description: 'Card title',
    minLength: 1,
    maxLength: 200,
    example: 'Implement user authentication system'
  })
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiPropertyOptional({ 
    description: 'Card detailed description',
    maxLength: 5000,
    example: 'Design and implement JWT-based authentication with password reset functionality'
  })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @ApiProperty({ 
    description: 'Card type/category',
    enum: CardType,
    example: CardType.FEATURE
  })
  @IsEnum(CardType)
  card_type: CardType;

  @ApiPropertyOptional({ 
    description: 'Card priority level',
    enum: KanbanCardPriority,
    default: KanbanCardPriority.MEDIUM
  })
  @IsOptional()
  @IsEnum(KanbanCardPriority)
  priority?: KanbanCardPriority;

  @ApiPropertyOptional({ 
    description: 'User assigned to this card',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID(4)
  assigned_to?: string;

  @ApiPropertyOptional({ 
    description: 'Card due date',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ 
    description: 'Estimated effort in hours',
    example: 8
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_hours?: number;

  @ApiPropertyOptional({ 
    description: 'Card tags for categorization',
    type: 'array',
    items: { type: 'string' },
    example: ['frontend', 'security', 'api']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Card color for UI display',
    example: '#3b82f6'
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;

  @ApiPropertyOptional({ 
    description: 'Custom field values',
    type: 'object',
    additionalProperties: true,
    example: {
      story_points: 5,
      business_value: 'high',
      component: 'authentication'
    }
  })
  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Checklist items',
    type: 'array',
    example: [
      { id: '1', text: 'Design login form', completed: false },
      { id: '2', text: 'Implement JWT tokens', completed: false }
    ]
  })
  @IsOptional()
  @IsArray()
  checklist?: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;

  @ApiPropertyOptional({ 
    description: 'Card dependencies (other card IDs)',
    type: 'array',
    items: { type: 'string', format: 'uuid' }
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  dependencies?: string[];
}

// DTO for updating kanban card
export class UpdateKanbanCardDto {
  @ApiPropertyOptional({ 
    description: 'Card title',
    minLength: 1,
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @ApiPropertyOptional({ 
    description: 'Card detailed description',
    maxLength: 5000
  })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Card type/category',
    enum: CardType
  })
  @IsOptional()
  @IsEnum(CardType)
  card_type?: CardType;

  @ApiPropertyOptional({ 
    description: 'Card priority level',
    enum: KanbanCardPriority
  })
  @IsOptional()
  @IsEnum(KanbanCardPriority)
  priority?: KanbanCardPriority;

  @ApiPropertyOptional({ 
    description: 'Card status',
    enum: KanbanCardStatus
  })
  @IsOptional()
  @IsEnum(KanbanCardStatus)
  status?: KanbanCardStatus;

  @ApiPropertyOptional({ 
    description: 'User assigned to this card',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID(4)
  assigned_to?: string;

  @ApiPropertyOptional({ 
    description: 'Card due date',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ 
    description: 'Estimated effort in hours'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_hours?: number;

  @ApiPropertyOptional({ 
    description: 'Actual time spent in hours'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actual_hours?: number;

  @ApiPropertyOptional({ 
    description: 'Card tags for categorization',
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Card color for UI display'
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;

  @ApiPropertyOptional({ 
    description: 'Custom field values',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Checklist items',
    type: 'array'
  })
  @IsOptional()
  @IsArray()
  checklist?: Array<{
    id: string;
    text: string;
    completed: boolean;
    completed_by?: string;
    completed_at?: string;
  }>;

  @ApiPropertyOptional({ 
    description: 'Card dependencies (other card IDs)',
    type: 'array',
    items: { type: 'string', format: 'uuid' }
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  dependencies?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether card is blocked'
  })
  @IsOptional()
  @IsBoolean()
  is_blocked?: boolean;

  @ApiPropertyOptional({ 
    description: 'Reason why card is blocked'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  blocked_reason?: string;
}

// DTO for moving card between stages
export class MoveKanbanCardDto {
  @ApiProperty({ 
    description: 'Target stage ID',
    format: 'uuid'
  })
  @IsUUID(4)
  target_stage_id: string;

  @ApiProperty({ 
    description: 'New position in target stage (0-based)'
  })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiPropertyOptional({ 
    description: 'Reason for moving the card'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  move_reason?: string;
}

// Extended card with additional details
export class KanbanCardWithDetails extends KanbanCard {
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
    description: 'Current stage details',
    type: 'object',
    properties: {
      name: { type: 'string' },
      stage_type: { type: 'string' },
      color: { type: 'string' },
    },
  })
  stage?: {
    name: string;
    stage_type: string;
    color?: string;
  };

  @ApiPropertyOptional({ 
    description: 'Assigned user details',
    type: 'object',
    properties: {
      full_name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      avatar_url: { type: 'string' },
    },
  })
  assignee?: {
    full_name: string;
    email: string;
    avatar_url?: string;
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
    description: 'Card activity timeline'
  })
  activity?: Array<{
    id: string;
    type: string;
    description: string;
    user_name: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;

  @ApiPropertyOptional({ 
    description: 'Dependency card details'
  })
  dependency_details?: Array<{
    id: string;
    title: string;
    status: string;
    stage_name: string;
  }>;
}

// Card analytics and metrics
export class KanbanCardAnalytics {
  @ApiProperty({ description: 'Card identifier', format: 'uuid' })
  card_id: string;

  @ApiProperty({ description: 'Card title' })
  card_title: string;

  @ApiProperty({ description: 'Card type' })
  card_type: CardType;

  @ApiProperty({ description: 'Card priority' })
  priority: KanbanCardPriority;

  @ApiProperty({ description: 'Days since card creation' })
  age_days: number;

  @ApiProperty({ description: 'Days spent in current stage' })
  days_in_current_stage: number;

  @ApiProperty({ description: 'Total days in progress (excluding Done)' })
  total_progress_days: number;

  @ApiProperty({ description: 'Whether card is overdue' })
  is_overdue: boolean;

  @ApiPropertyOptional({ description: 'Days overdue if applicable' })
  days_overdue?: number;

  @ApiProperty({ description: 'Completion percentage based on checklist' })
  completion_percentage: number;

  @ApiProperty({ description: 'Time tracking efficiency (actual vs estimated)' })
  time_efficiency?: {
    estimated_hours: number;
    actual_hours: number;
    efficiency_ratio: number; // actual/estimated
  };

  @ApiProperty({ description: 'Stage movement history' })
  stage_history: Array<{
    stage_name: string;
    entered_at: string;
    exited_at?: string;
    duration_days?: number;
  }>;

  @ApiProperty({ description: 'Blocking statistics' })
  blocking_stats: {
    total_blocked_days: number;
    blocking_incidents: number;
    current_blocked_duration?: number;
  };
}