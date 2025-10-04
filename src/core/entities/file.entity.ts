import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsPositive,
  IsIn,
  Length,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FileType {
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

export enum FileStatus {
  UPLOADING = 'uploading',
  ACTIVE = 'active',
  PROCESSING = 'processing',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export class File {
  @ApiProperty({ 
    description: 'Unique file identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'Studio identifier that owns this file',
    format: 'uuid'
  })
  @IsUUID(4)
  studio_id: string;

  @ApiProperty({ 
    description: 'User identifier who uploaded the file',
    format: 'uuid'
  })
  @IsUUID(4)
  uploaded_by: string;

  @ApiProperty({ 
    description: 'Original file name with extension',
    maxLength: 255
  })
  @IsString()
  @Length(1, 255)
  file_name: string;

  @ApiProperty({ 
    description: 'Supabase Storage path/key',
    maxLength: 1000
  })
  @IsString()
  @Length(1, 1000)
  storage_path: string;

  @ApiProperty({ 
    description: 'File size in bytes'
  })
  @IsNumber()
  @IsPositive()
  file_size: number;

  @ApiProperty({ 
    description: 'MIME type of the file',
    maxLength: 100
  })
  @IsString()
  @Length(1, 100)
  mime_type: string;

  @ApiProperty({ 
    description: 'File type category',
    enum: FileType
  })
  @IsEnum(FileType)
  file_type: FileType;

  @ApiProperty({ 
    description: 'Current file status',
    enum: FileStatus
  })
  @IsEnum(FileStatus)
  status: FileStatus;

  @ApiPropertyOptional({ 
    description: 'Optional file description or notes',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'File metadata as JSON',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ 
    description: 'File upload timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({ 
    description: 'File last update timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  updated_at: string;
}

// DTO for file upload initiation
export class CreateFileDto {
  @ApiProperty({ 
    description: 'Original file name with extension',
    maxLength: 255,
    example: 'marketing-report.pdf'
  })
  @IsString()
  @Length(1, 255)
  file_name: string;

  @ApiProperty({ 
    description: 'File size in bytes',
    example: 2097152
  })
  @IsNumber()
  @IsPositive()
  file_size: number;

  @ApiProperty({ 
    description: 'MIME type of the file',
    maxLength: 100,
    example: 'application/pdf'
  })
  @IsString()
  @Length(1, 100)
  mime_type: string;

  @ApiPropertyOptional({ 
    description: 'Optional file description or notes',
    maxLength: 1000,
    example: 'Q4 marketing performance analysis'
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'File metadata as JSON',
    type: 'object',
    additionalProperties: true,
    example: { tags: ['marketing', 'report'], department: 'sales' }
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

// DTO for updating file information
export class UpdateFileDto {
  @ApiPropertyOptional({ 
    description: 'File name',
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  file_name?: string;

  @ApiPropertyOptional({ 
    description: 'File status',
    enum: FileStatus
  })
  @IsOptional()
  @IsEnum(FileStatus)
  status?: FileStatus;

  @ApiPropertyOptional({ 
    description: 'File description or notes',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'File metadata as JSON',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

// File with extended information
export class FileWithDetails extends File {
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
    description: 'Uploader details',
    type: 'object',
    properties: {
      full_name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  })
  uploader?: {
    full_name: string;
    email: string;
  };

  @ApiPropertyOptional({ 
    description: 'Pre-signed download URL (temporary)',
    format: 'uri'
  })
  @IsOptional()
  @IsUrl()
  download_url?: string;
}

// Supabase Storage upload response
export class FileUploadResponse {
  @ApiProperty({ 
    description: 'File record identifier',
    format: 'uuid'
  })
  file_id: string;

  @ApiProperty({ 
    description: 'Pre-signed upload URL for direct storage upload',
    format: 'uri'
  })
  @IsUrl()
  upload_url: string;

  @ApiProperty({ 
    description: 'Storage path for the file'
  })
  storage_path: string;

  @ApiProperty({ 
    description: 'Upload expiry timestamp',
    format: 'date-time'
  })
  @IsDateString()
  expires_at: string;
}

// File analytics and usage
export class FileAnalytics {
  @ApiProperty({ description: 'File identifier', format: 'uuid' })
  file_id: string;

  @ApiProperty({ description: 'File name' })
  file_name: string;

  @ApiProperty({ description: 'File type category' })
  file_type: FileType;

  @ApiProperty({ description: 'File size in bytes' })
  file_size: number;

  @ApiProperty({ description: 'Download count' })
  download_count: number;

  @ApiProperty({ description: 'View count' })
  view_count: number;

  @ApiProperty({ description: 'Share count' })
  share_count: number;

  @ApiPropertyOptional({ 
    description: 'Last accessed timestamp',
    format: 'date-time'
  })
  last_accessed_at?: string;

  @ApiProperty({ 
    description: 'File age in days'
  })
  age_days: number;
}

// File size validation constraints
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 500 * 1024 * 1024, // 500MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 25 * 1024 * 1024, // 25MB
  SPREADSHEET: 25 * 1024 * 1024, // 25MB
  PRESENTATION: 100 * 1024 * 1024, // 100MB
  ARCHIVE: 200 * 1024 * 1024, // 200MB
  OTHER: 25 * 1024 * 1024, // 25MB
} as const;

// Allowed MIME types per file type
export const ALLOWED_MIME_TYPES = {
  [FileType.IMAGE]: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  [FileType.VIDEO]: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ],
  [FileType.AUDIO]: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/webm',
  ],
  [FileType.DOCUMENT]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ],
  [FileType.SPREADSHEET]: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  [FileType.PRESENTATION]: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  [FileType.ARCHIVE]: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/gzip',
  ],
  [FileType.OTHER]: ['*'], // Accept any mime type for other category
} as const;