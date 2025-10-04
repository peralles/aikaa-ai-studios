import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum UserCompanyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UserCompany {
  @ApiProperty({ 
    description: 'Unique user-company relationship identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'User identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  user_id: string;

  @ApiProperty({ 
    description: 'Company identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  company_id: string;

  @ApiProperty({ 
    description: 'User role within the company',
    enum: UserRole,
    default: UserRole.MEMBER
  })
  @IsEnum(UserRole, {
    message: 'Role must be either admin or member',
  })
  role: UserRole;

  @ApiProperty({ 
    description: 'Status of the user-company relationship',
    enum: UserCompanyStatus,
    default: UserCompanyStatus.PENDING
  })
  @IsEnum(UserCompanyStatus, {
    message: 'Status must be pending, approved, or rejected',
  })
  status: UserCompanyStatus;

  @ApiPropertyOptional({ 
    description: 'Timestamp when the user was approved to join the company',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  joined_at?: string;

  @ApiProperty({ 
    description: 'Relationship creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;
}

// DTO for inviting a user to a company
export class InviteUserToCompanyDto {
  @ApiProperty({ 
    description: 'Email of the user to invite',
    format: 'email',
    example: 'user@example.com'
  })
  @IsString()
  email: string;

  @ApiProperty({ 
    description: 'Role to assign to the user',
    enum: UserRole,
    default: UserRole.MEMBER,
    example: UserRole.MEMBER
  })
  @IsEnum(UserRole)
  role: UserRole;
}

// DTO for updating user role in company
export class UpdateUserCompanyRoleDto {
  @ApiProperty({ 
    description: 'New role for the user',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @IsEnum(UserRole)
  role: UserRole;
}

// DTO for approving/rejecting user company membership
export class UpdateUserCompanyStatusDto {
  @ApiProperty({ 
    description: 'New status for the membership',
    enum: UserCompanyStatus,
    example: UserCompanyStatus.APPROVED
  })
  @IsEnum(UserCompanyStatus)
  status: UserCompanyStatus;
}

// Extended user-company relationship with user and company details
export class UserCompanyWithDetails extends UserCompany {
  @ApiPropertyOptional({ 
    description: 'User details',
    type: 'object',
    properties: {
      full_name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  })
  user?: {
    full_name: string;
    email: string;
  };

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
}