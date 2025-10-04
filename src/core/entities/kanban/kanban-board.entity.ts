import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsObject,
  IsArray,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum KanbanBoardStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  TEMPLATE = 'template',
}

export enum BoardVisibility {
  PRIVATE = 'private',
  STUDIO = 'studio',
  COMPANY = 'company',
}

export class KanbanBoard {
  @ApiProperty({ 
    description: 'Unique kanban board identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'Studio identifier that owns this board',
    format: 'uuid'
  })
  @IsUUID(4)
  studio_id: string;

  @ApiProperty({ 
    description: 'Board name',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Board description',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ 
    description: 'Board status',
    enum: KanbanBoardStatus
  })
  @IsEnum(KanbanBoardStatus)
  status: KanbanBoardStatus;

  @ApiProperty({ 
    description: 'Board visibility level',
    enum: BoardVisibility
  })
  @IsEnum(BoardVisibility)
  visibility: BoardVisibility;

  @ApiPropertyOptional({ 
    description: 'Board configuration settings',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  settings?: {
    auto_archive_completed?: boolean;
    card_aging_enabled?: boolean;
    due_date_notifications?: boolean;
    workflow_automation?: boolean;
    custom_fields_enabled?: boolean;
    time_tracking_enabled?: boolean;
  };

  @ApiPropertyOptional({ 
    description: 'Board color theme/background'
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  background_color?: string;

  @ApiPropertyOptional({ 
    description: 'Board tags for categorization',
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    description: 'Whether board is a favorite for the user'
  })
  @IsBoolean()
  is_favorite: boolean;

  @ApiPropertyOptional({ 
    description: 'Workflow template ID for automation triggers',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID(4)
  workflow_template_id?: string;

  @ApiProperty({ 
    description: 'User ID who created the board',
    format: 'uuid'
  })
  @IsUUID(4)
  created_by: string;

  @ApiProperty({ 
    description: 'Board creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({ 
    description: 'Board last update timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  updated_at: string;
}

// DTO for creating a new kanban board
export class CreateKanbanBoardDto {
  @ApiProperty({ 
    description: 'Board name',
    minLength: 3,
    maxLength: 100,
    example: 'Product Development Pipeline'
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Board description',
    maxLength: 1000,
    example: 'Track product features from ideation to release'
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Board visibility level',
    enum: BoardVisibility,
    default: BoardVisibility.STUDIO
  })
  @IsOptional()
  @IsEnum(BoardVisibility)
  visibility?: BoardVisibility;

  @ApiPropertyOptional({ 
    description: 'Board configuration settings',
    type: 'object',
    additionalProperties: true,
    example: {
      auto_archive_completed: true,
      card_aging_enabled: false,
      due_date_notifications: true,
      workflow_automation: false
    }
  })
  @IsOptional()
  @IsObject()
  settings?: {
    auto_archive_completed?: boolean;
    card_aging_enabled?: boolean;
    due_date_notifications?: boolean;
    workflow_automation?: boolean;
    custom_fields_enabled?: boolean;
    time_tracking_enabled?: boolean;
  };

  @ApiPropertyOptional({ 
    description: 'Board color theme/background',
    example: '#2563eb'
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  background_color?: string;

  @ApiPropertyOptional({ 
    description: 'Board tags for categorization',
    type: 'array',
    items: { type: 'string' },
    example: ['product', 'development', 'features']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Workflow template ID for automation triggers',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID(4)
  workflow_template_id?: string;
}

// DTO for updating kanban board
export class UpdateKanbanBoardDto {
  @ApiPropertyOptional({ 
    description: 'Board name',
    minLength: 3,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Board description',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Board status',
    enum: KanbanBoardStatus
  })
  @IsOptional()
  @IsEnum(KanbanBoardStatus)
  status?: KanbanBoardStatus;

  @ApiPropertyOptional({ 
    description: 'Board visibility level',
    enum: BoardVisibility
  })
  @IsOptional()
  @IsEnum(BoardVisibility)
  visibility?: BoardVisibility;

  @ApiPropertyOptional({ 
    description: 'Board configuration settings',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  settings?: {
    auto_archive_completed?: boolean;
    card_aging_enabled?: boolean;
    due_date_notifications?: boolean;
    workflow_automation?: boolean;
    custom_fields_enabled?: boolean;
    time_tracking_enabled?: boolean;
  };

  @ApiPropertyOptional({ 
    description: 'Board color theme/background'
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  background_color?: string;

  @ApiPropertyOptional({ 
    description: 'Board tags for categorization',
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether board is a favorite for the user'
  })
  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;

  @ApiPropertyOptional({ 
    description: 'Workflow template ID for automation triggers',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID(4)
  workflow_template_id?: string;
}

// Extended board with additional details
export class KanbanBoardWithDetails extends KanbanBoard {
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
    description: 'Board statistics'
  })
  stats?: {
    total_stages: number;
    total_cards: number;
    active_cards: number;
    completed_cards: number;
    overdue_cards: number;
    total_members: number;
  };

  @ApiPropertyOptional({ 
    description: 'Recent activity summary'
  })
  recent_activity?: Array<{
    type: string;
    description: string;
    user_name: string;
    timestamp: string;
  }>;
}

// Board analytics and metrics
export class KanbanBoardAnalytics {
  @ApiProperty({ description: 'Board identifier', format: 'uuid' })
  board_id: string;

  @ApiProperty({ description: 'Board name' })
  board_name: string;

  @ApiProperty({ description: 'Total number of stages' })
  total_stages: number;

  @ApiProperty({ description: 'Total number of cards' })
  total_cards: number;

  @ApiProperty({ description: 'Cards by status' })
  cards_by_status: Record<string, number>;

  @ApiProperty({ description: 'Average cards per stage' })
  avg_cards_per_stage: number;

  @ApiProperty({ description: 'Average card completion time in days' })
  avg_completion_days: number;

  @ApiProperty({ description: 'Cards created this week' })
  cards_created_this_week: number;

  @ApiProperty({ description: 'Cards completed this week' })
  cards_completed_this_week: number;

  @ApiProperty({ description: 'Most active stage' })
  most_active_stage?: {
    stage_name: string;
    card_count: number;
  };

  @ApiProperty({ description: 'Bottleneck stage (longest avg duration)' })
  bottleneck_stage?: {
    stage_name: string;
    avg_duration_days: number;
  };

  @ApiProperty({ description: 'Board members and activity' })
  member_activity: Array<{
    user_id: string;
    user_name: string;
    cards_assigned: number;
    cards_completed: number;
    last_activity: string;
  }>;

  @ApiProperty({ description: 'Workflow automation statistics' })
  automation_stats?: {
    total_triggers: number;
    successful_executions: number;
    failed_executions: number;
    automation_enabled: boolean;
  };
}