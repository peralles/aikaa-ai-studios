import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsObject,
  IsArray,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  USER = 'user',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
  COLOR = 'color',
  PROGRESS = 'progress',
  RATING = 'rating',
  CURRENCY = 'currency',
  DURATION = 'duration',
}

export enum FieldScope {
  BOARD = 'board',
  CARD_TYPE = 'card_type',
  GLOBAL = 'global',
}

export class FieldValidation {
  @ApiPropertyOptional({ description: 'Minimum value for numbers/ratings' })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional({ description: 'Maximum value for numbers/ratings' })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiPropertyOptional({ description: 'Minimum length for text fields' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_length?: number;

  @ApiPropertyOptional({ description: 'Maximum length for text fields' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max_length?: number;

  @ApiPropertyOptional({ description: 'Regular expression pattern for validation' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ description: 'Custom validation error message' })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  error_message?: string;
}

export class FieldOption {
  @ApiProperty({ description: 'Option value' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Option display label' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ description: 'Option color (for visual differentiation)' })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;

  @ApiPropertyOptional({ description: 'Option description' })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;

  @ApiProperty({ description: 'Whether option is active' })
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({ description: 'Option sort order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;
}

export class CardFieldDefinition {
  @ApiProperty({ 
    description: 'Unique field definition identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'Board identifier (if board-scoped)',
    format: 'uuid'
  })
  @IsUUID(4)
  board_id: string;

  @ApiProperty({ 
    description: 'Field name/key (used in custom_fields)',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @Length(1, 50)
  field_name: string;

  @ApiProperty({ 
    description: 'Field display label',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @Length(1, 100)
  display_label: string;

  @ApiPropertyOptional({ 
    description: 'Field description/help text',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ 
    description: 'Field data type',
    enum: FieldType
  })
  @IsEnum(FieldType)
  field_type: FieldType;

  @ApiProperty({ 
    description: 'Field scope (board, card type, or global)',
    enum: FieldScope
  })
  @IsEnum(FieldScope)
  scope: FieldScope;

  @ApiPropertyOptional({ 
    description: 'Card types this field applies to (if card_type scoped)',
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicable_card_types?: string[];

  @ApiProperty({ 
    description: 'Whether field is required'
  })
  @IsBoolean()
  is_required: boolean;

  @ApiProperty({ 
    description: 'Whether field is visible in card list view'
  })
  @IsBoolean()
  show_in_list: boolean;

  @ApiProperty({ 
    description: 'Whether field is searchable'
  })
  @IsBoolean()
  is_searchable: boolean;

  @ApiProperty({ 
    description: 'Field display order'
  })
  @IsNumber()
  @Min(0)
  sort_order: number;

  @ApiPropertyOptional({ 
    description: 'Default value for new cards'
  })
  @IsOptional()
  default_value?: any;

  @ApiPropertyOptional({ 
    description: 'Field validation rules',
    type: FieldValidation
  })
  @IsOptional()
  @IsObject()
  validation?: FieldValidation;

  @ApiPropertyOptional({ 
    description: 'Options for select/multiselect fields',
    type: [FieldOption]
  })
  @IsOptional()
  @IsArray()
  options?: FieldOption[];

  @ApiPropertyOptional({ 
    description: 'Field configuration specific to field type',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  config?: {
    // For progress fields
    max_value?: number;
    show_percentage?: boolean;
    
    // For currency fields
    currency_code?: string;
    decimal_places?: number;
    
    // For duration fields
    unit?: 'minutes' | 'hours' | 'days' | 'weeks';
    
    // For rating fields
    rating_scale?: number; // e.g., 5 for 1-5 stars
    rating_icons?: string; // e.g., 'stars', 'thumbs', 'hearts'
    
    // For user fields
    allow_multiple?: boolean;
    restrict_to_board_members?: boolean;
    
    // For date fields
    include_time?: boolean;
    default_to_today?: boolean;
  };

  @ApiProperty({ 
    description: 'Whether field is active/enabled'
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ 
    description: 'User ID who created the field definition',
    format: 'uuid'
  })
  @IsUUID(4)
  created_by: string;

  @ApiProperty({ 
    description: 'Field creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({ 
    description: 'Field last update timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  updated_at: string;
}

// DTO for creating a new field definition
export class CreateCardFieldDefinitionDto {
  @ApiProperty({ 
    description: 'Field name/key (used in custom_fields)',
    minLength: 1,
    maxLength: 50,
    example: 'story_points'
  })
  @IsString()
  @Length(1, 50)
  field_name: string;

  @ApiProperty({ 
    description: 'Field display label',
    minLength: 1,
    maxLength: 100,
    example: 'Story Points'
  })
  @IsString()
  @Length(1, 100)
  display_label: string;

  @ApiPropertyOptional({ 
    description: 'Field description/help text',
    maxLength: 500,
    example: 'Estimated effort required to complete this card (Fibonacci scale)'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ 
    description: 'Field data type',
    enum: FieldType,
    example: FieldType.SELECT
  })
  @IsEnum(FieldType)
  field_type: FieldType;

  @ApiPropertyOptional({ 
    description: 'Field scope (board, card type, or global)',
    enum: FieldScope,
    default: FieldScope.BOARD
  })
  @IsOptional()
  @IsEnum(FieldScope)
  scope?: FieldScope;

  @ApiPropertyOptional({ 
    description: 'Card types this field applies to (if card_type scoped)',
    type: 'array',
    items: { type: 'string' },
    example: ['feature', 'story', 'task']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicable_card_types?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether field is required',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether field is visible in card list view',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  show_in_list?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether field is searchable',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  is_searchable?: boolean;

  @ApiPropertyOptional({ 
    description: 'Default value for new cards',
    example: '3'
  })
  @IsOptional()
  default_value?: any;

  @ApiPropertyOptional({ 
    description: 'Field validation rules',
    type: FieldValidation,
    example: { min: 1, max: 21, error_message: 'Story points must be between 1 and 21' }
  })
  @IsOptional()
  @IsObject()
  validation?: FieldValidation;

  @ApiPropertyOptional({ 
    description: 'Options for select/multiselect fields',
    type: [FieldOption],
    example: [
      { value: '1', label: '1 Point', color: '#22c55e', is_active: true },
      { value: '2', label: '2 Points', color: '#3b82f6', is_active: true },
      { value: '3', label: '3 Points', color: '#f59e0b', is_active: true }
    ]
  })
  @IsOptional()
  @IsArray()
  options?: FieldOption[];

  @ApiPropertyOptional({ 
    description: 'Field configuration specific to field type',
    type: 'object',
    additionalProperties: true,
    example: { rating_scale: 5, rating_icons: 'stars' }
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

// DTO for updating field definition
export class UpdateCardFieldDefinitionDto {
  @ApiPropertyOptional({ 
    description: 'Field display label',
    minLength: 1,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  display_label?: string;

  @ApiPropertyOptional({ 
    description: 'Field description/help text',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Card types this field applies to (if card_type scoped)',
    type: 'array',
    items: { type: 'string' }
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicable_card_types?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether field is required'
  })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether field is visible in card list view'
  })
  @IsOptional()
  @IsBoolean()
  show_in_list?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether field is searchable'
  })
  @IsOptional()
  @IsBoolean()
  is_searchable?: boolean;

  @ApiPropertyOptional({ 
    description: 'Field display order'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional({ 
    description: 'Default value for new cards'
  })
  @IsOptional()
  default_value?: any;

  @ApiPropertyOptional({ 
    description: 'Field validation rules',
    type: FieldValidation
  })
  @IsOptional()
  @IsObject()
  validation?: FieldValidation;

  @ApiPropertyOptional({ 
    description: 'Options for select/multiselect fields',
    type: [FieldOption]
  })
  @IsOptional()
  @IsArray()
  options?: FieldOption[];

  @ApiPropertyOptional({ 
    description: 'Field configuration specific to field type',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Whether field is active/enabled'
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// Extended field definition with usage statistics
export class CardFieldDefinitionWithStats extends CardFieldDefinition {
  @ApiPropertyOptional({ 
    description: 'Field usage statistics'
  })
  usage_stats?: {
    total_cards_using: number;
    cards_with_value: number;
    usage_percentage: number;
    most_common_values: Array<{
      value: any;
      count: number;
      percentage: number;
    }>;
    last_used_at?: string;
  };

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
}

// Field analytics and insights
export class CardFieldAnalytics {
  @ApiProperty({ description: 'Field definition identifier', format: 'uuid' })
  field_id: string;

  @ApiProperty({ description: 'Field name' })
  field_name: string;

  @ApiProperty({ description: 'Field type' })
  field_type: FieldType;

  @ApiProperty({ description: 'Total cards in board' })
  total_cards: number;

  @ApiProperty({ description: 'Cards using this field' })
  cards_with_field: number;

  @ApiProperty({ description: 'Field adoption rate percentage' })
  adoption_rate: number;

  @ApiProperty({ description: 'Value distribution for select fields' })
  value_distribution: Array<{
    value: any;
    count: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Field completion trend over time' })
  completion_trend: Array<{
    date: string;
    cards_with_value: number;
    total_cards: number;
    completion_rate: number;
  }>;

  @ApiPropertyOptional({ description: 'Performance impact metrics' })
  performance_metrics?: {
    avg_completion_time_with_field: number;
    avg_completion_time_without_field: number;
    correlation_coefficient: number; // -1 to 1, correlation with completion speed
  };

  @ApiProperty({ description: 'Field validation error frequency' })
  validation_errors: {
    total_errors: number;
    error_types: Array<{
      error_type: string;
      count: number;
      percentage: number;
    }>;
  };
}

// Predefined field templates for common use cases
export const COMMON_FIELD_TEMPLATES = {
  STORY_POINTS: {
    field_name: 'story_points',
    display_label: 'Story Points',
    description: 'Estimated effort using Fibonacci scale',
    field_type: FieldType.SELECT,
    options: [
      { value: '1', label: '1', color: '#22c55e', is_active: true },
      { value: '2', label: '2', color: '#3b82f6', is_active: true },
      { value: '3', label: '3', color: '#f59e0b', is_active: true },
      { value: '5', label: '5', color: '#f97316', is_active: true },
      { value: '8', label: '8', color: '#ef4444', is_active: true },
      { value: '13', label: '13', color: '#8b5cf6', is_active: true },
      { value: '21', label: '21', color: '#6b7280', is_active: true },
    ]
  },
  BUSINESS_VALUE: {
    field_name: 'business_value',
    display_label: 'Business Value',
    description: 'Impact on business objectives',
    field_type: FieldType.SELECT,
    options: [
      { value: 'critical', label: 'Critical', color: '#dc2626', is_active: true },
      { value: 'high', label: 'High', color: '#ea580c', is_active: true },
      { value: 'medium', label: 'Medium', color: '#ca8a04', is_active: true },
      { value: 'low', label: 'Low', color: '#65a30d', is_active: true },
    ]
  },
  COMPLETION_PERCENTAGE: {
    field_name: 'completion_percentage',
    display_label: 'Completion %',
    description: 'Work completion percentage',
    field_type: FieldType.PROGRESS,
    config: { max_value: 100, show_percentage: true }
  },
} as const;