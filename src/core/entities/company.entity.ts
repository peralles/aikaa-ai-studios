import {
  IsString,
  IsEmail,
  Length,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsDateString,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IndustryType {
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  EDUCATION = 'education',
  CONSULTING = 'consulting',
  OTHER = 'other',
}

export class CompanyBranchInfo {
  @ApiProperty({ description: 'Branch name', minLength: 2, maxLength: 100 })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: 'Branch physical address', minLength: 10, maxLength: 500 })
  @IsString()
  @Length(10, 500)
  address: string;

  @ApiPropertyOptional({ description: 'Branch contact email' })
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiPropertyOptional({ 
    description: 'Branch contact phone',
    pattern: '^[\\+]?[1-9][\\d]{0,15}$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, {
    message: 'Phone number must be a valid international format',
  })
  contact_phone?: string;
}

export class Company {
  @ApiProperty({ 
    description: 'Unique company identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'Company name',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @Length(3, 100, {
    message: 'Company name must be between 3 and 100 characters',
  })
  name: string;

  @ApiProperty({ 
    description: 'Industry classification',
    enum: IndustryType
  })
  @IsEnum(IndustryType, {
    message: 'Industry type must be one of: technology, healthcare, finance, retail, manufacturing, education, consulting, other',
  })
  industry_type: IndustryType;

  @ApiProperty({ 
    description: 'Primary contact email',
    format: 'email'
  })
  @IsEmail({}, {
    message: 'Contact email must be a valid email address',
  })
  contact_email: string;

  @ApiPropertyOptional({ 
    description: 'Optional contact phone number',
    pattern: '^[\\+]?[1-9][\\d]{0,15}$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, {
    message: 'Phone number must be a valid international format',
  })
  contact_phone?: string;

  @ApiProperty({ 
    description: 'Physical headquarters address',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @Length(10, 500, {
    message: 'Headquarters address must be between 10 and 500 characters',
  })
  headquarters_address: string;

  @ApiPropertyOptional({ 
    description: 'Array of company branches',
    type: [CompanyBranchInfo],
    default: []
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompanyBranchInfo)
  @Transform(({ value }) => value || [])
  branches: CompanyBranchInfo[];

  @ApiProperty({ 
    description: 'Company creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({ 
    description: 'Company last update timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  updated_at: string;
}

// DTO for creating a new company
export class CreateCompanyDto {
  @ApiProperty({ 
    description: 'Company name',
    minLength: 3,
    maxLength: 100,
    example: 'Tech Innovations Ltd'
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({ 
    description: 'Industry classification',
    enum: IndustryType,
    example: IndustryType.TECHNOLOGY
  })
  @IsEnum(IndustryType)
  industry_type: IndustryType;

  @ApiProperty({ 
    description: 'Primary contact email',
    format: 'email',
    example: 'contact@techinnovations.com'
  })
  @IsEmail()
  contact_email: string;

  @ApiPropertyOptional({ 
    description: 'Optional contact phone number',
    pattern: '^[\\+]?[1-9][\\d]{0,15}$',
    example: '+1-555-0123'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/)
  contact_phone?: string;

  @ApiProperty({ 
    description: 'Physical headquarters address',
    minLength: 10,
    maxLength: 500,
    example: '123 Innovation Drive, Silicon Valley, CA 94000'
  })
  @IsString()
  @Length(10, 500)
  headquarters_address: string;

  @ApiPropertyOptional({ 
    description: 'Array of company branches',
    type: [CompanyBranchInfo],
    default: []
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompanyBranchInfo)
  branches?: CompanyBranchInfo[];
}

// DTO for updating company information
export class UpdateCompanyDto {
  @ApiPropertyOptional({ 
    description: 'Company name',
    minLength: 3,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Industry classification',
    enum: IndustryType
  })
  @IsOptional()
  @IsEnum(IndustryType)
  industry_type?: IndustryType;

  @ApiPropertyOptional({ 
    description: 'Primary contact email',
    format: 'email'
  })
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiPropertyOptional({ 
    description: 'Optional contact phone number',
    pattern: '^[\\+]?[1-9][\\d]{0,15}$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/)
  contact_phone?: string;

  @ApiPropertyOptional({ 
    description: 'Physical headquarters address',
    minLength: 10,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  headquarters_address?: string;

  @ApiPropertyOptional({ 
    description: 'Array of company branches',
    type: [CompanyBranchInfo]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompanyBranchInfo)
  branches?: CompanyBranchInfo[];
}