import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BusinessArea {
  MARKETING = 'marketing',
  SALES = 'sales',
  OPERATIONS = 'operations',
  CUSTOMER_SUPPORT = 'customer_support',
  FINANCE = 'finance',
  HR = 'hr',
  OTHER = 'other',
}

export class Studio {
  @ApiProperty({ 
    description: 'Unique studio identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'Company identifier that owns this studio',
    format: 'uuid'
  })
  @IsUUID(4)
  company_id: string;

  @ApiProperty({ 
    description: 'Studio name',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @Length(3, 100, {
    message: 'Studio name must be between 3 and 100 characters',
  })
  name: string;

  @ApiPropertyOptional({ 
    description: 'Studio purpose description',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ 
    description: 'Business area focus of the studio',
    enum: BusinessArea
  })
  @IsEnum(BusinessArea, {
    message: 'Business area must be one of: marketing, sales, operations, customer_support, finance, hr, other',
  })
  business_area: BusinessArea;

  @ApiProperty({ 
    description: 'User ID who created the studio',
    format: 'uuid'
  })
  @IsUUID(4)
  created_by: string;

  @ApiProperty({ 
    description: 'Studio creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({ 
    description: 'Studio last update timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  updated_at: string;
}

// DTO for creating a new studio
export class CreateStudioDto {
  @ApiProperty({ 
    description: 'Studio name',
    minLength: 3,
    maxLength: 100,
    example: 'Marketing Automation Hub'
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Studio purpose description',
    maxLength: 1000,
    example: 'Central hub for all marketing automation workflows and campaigns'
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ 
    description: 'Business area focus of the studio',
    enum: BusinessArea,
    example: BusinessArea.MARKETING
  })
  @IsEnum(BusinessArea)
  business_area: BusinessArea;
}

// DTO for updating studio information
export class UpdateStudioDto {
  @ApiPropertyOptional({ 
    description: 'Studio name',
    minLength: 3,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Studio purpose description',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Business area focus of the studio',
    enum: BusinessArea
  })
  @IsOptional()
  @IsEnum(BusinessArea)
  business_area?: BusinessArea;
}

// Extended studio information with company details
export class StudioWithCompany extends Studio {
  @ApiPropertyOptional({ 
    description: 'Company details',
    type: 'object',
    properties: {
      name: { type: 'string' },
      industry_type: { type: 'string' },
    },
  })
  company?: {
    name: string;
    industry_type: string;
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
}

// Studio analytics summary
export class StudioAnalytics {
  @ApiProperty({ description: 'Studio identifier', format: 'uuid' })
  studio_id: string;

  @ApiProperty({ description: 'Studio name' })
  studio_name: string;

  @ApiProperty({ description: 'Total workflow executions' })
  total_executions: number;

  @ApiProperty({ description: 'Successful workflow executions' })
  successful_executions: number;

  @ApiProperty({ description: 'Failed workflow executions' })
  failed_executions: number;

  @ApiProperty({ description: 'Average execution duration in seconds' })
  avg_duration_seconds: number;

  @ApiProperty({ description: 'Number of unique users' })
  unique_users: number;

  @ApiProperty({ description: 'Number of files uploaded' })
  files_uploaded: number;

  @ApiProperty({ description: 'Storage used in bytes' })
  storage_used_bytes: number;

  @ApiProperty({ description: 'Number of Kanban boards' })
  kanban_boards_count: number;

  @ApiProperty({ description: 'Number of Kanban cards' })
  kanban_cards_count: number;

  @ApiPropertyOptional({ 
    description: 'Last execution timestamp',
    format: 'date-time'
  })
  last_execution_at?: string;
}