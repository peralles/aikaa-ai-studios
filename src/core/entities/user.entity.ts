import {
  IsString,
  IsEmail,
  Length,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class User {
  @ApiProperty({ 
    description: 'Unique user identifier (from Supabase Auth)',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'User email address (from Supabase Auth)',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'User display name',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100, {
    message: 'Full name must be between 2 and 100 characters',
  })
  full_name: string;

  @ApiProperty({ 
    description: 'User profile creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiPropertyOptional({ 
    description: 'Last authentication timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsOptional()
  @IsDateString()
  last_login_at?: string;
}

// DTO for creating user profile (after Supabase Auth registration)
export class CreateUserProfileDto {
  @ApiProperty({ 
    description: 'User display name',
    minLength: 2,
    maxLength: 100,
    example: 'John Doe'
  })
  @IsString()
  @Length(2, 100)
  full_name: string;
}

// DTO for updating user profile
export class UpdateUserProfileDto {
  @ApiPropertyOptional({ 
    description: 'User display name',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  full_name?: string;
}

// Extended user information with company relationships
export class UserWithCompanies extends User {
  @ApiPropertyOptional({ 
    description: 'Companies the user belongs to',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        company_id: { type: 'string', format: 'uuid' },
        company_name: { type: 'string' },
        role: { type: 'string', enum: ['admin', 'member'] },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
        joined_at: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  companies?: {
    company_id: string;
    company_name: string;
    role: 'admin' | 'member';
    status: 'pending' | 'approved' | 'rejected';
    joined_at?: string;
  }[];
}