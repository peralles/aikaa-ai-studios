import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum WorkflowExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

export enum StepExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RETRYING = 'retrying',
}

export class StepExecution {
  @ApiProperty({ 
    description: 'Step identifier from workflow template'
  })
  @IsString()
  step_id: string;

  @ApiProperty({ 
    description: 'Step execution status',
    enum: StepExecutionStatus
  })
  @IsEnum(StepExecutionStatus)
  status: StepExecutionStatus;

  @ApiPropertyOptional({ 
    description: 'Step execution start timestamp',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  started_at?: string;

  @ApiPropertyOptional({ 
    description: 'Step execution completion timestamp',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  completed_at?: string;

  @ApiPropertyOptional({ 
    description: 'Step execution duration in seconds'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_seconds?: number;

  @ApiPropertyOptional({ 
    description: 'Step input data',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  input?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Step output data',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  output?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Error details if step failed',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  error?: {
    message: string;
    code?: string;
    details?: Record<string, any>;
    stack_trace?: string;
  };

  @ApiPropertyOptional({ 
    description: 'Retry attempt number'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  retry_count?: number;

  @ApiPropertyOptional({ 
    description: 'ActivePieces execution ID for this step'
  })
  @IsOptional()
  @IsString()
  activepieces_execution_id?: string;
}

export class WorkflowExecution {
  @ApiProperty({ 
    description: 'Unique workflow execution identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  id: string;

  @ApiProperty({ 
    description: 'Workflow template identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  template_id: string;

  @ApiProperty({ 
    description: 'Studio identifier',
    format: 'uuid'
  })
  @IsUUID(4)
  studio_id: string;

  @ApiProperty({ 
    description: 'User ID who triggered the execution',
    format: 'uuid'
  })
  @IsUUID(4)
  triggered_by: string;

  @ApiProperty({ 
    description: 'Workflow execution status',
    enum: WorkflowExecutionStatus
  })
  @IsEnum(WorkflowExecutionStatus)
  status: WorkflowExecutionStatus;

  @ApiPropertyOptional({ 
    description: 'Execution start timestamp',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  started_at?: string;

  @ApiPropertyOptional({ 
    description: 'Execution completion timestamp',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  completed_at?: string;

  @ApiPropertyOptional({ 
    description: 'Total execution duration in seconds'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_seconds?: number;

  @ApiPropertyOptional({ 
    description: 'Trigger data that initiated the execution',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  trigger_data?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Execution context and variables',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;

  @ApiProperty({ 
    description: 'Step execution details',
    type: [StepExecution]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepExecution)
  step_executions: StepExecution[];

  @ApiPropertyOptional({ 
    description: 'Overall execution result',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  result?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Execution error details if failed',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  error?: {
    message: string;
    code?: string;
    failed_step?: string;
    details?: Record<string, any>;
  };

  @ApiPropertyOptional({ 
    description: 'ActivePieces flow run ID'
  })
  @IsOptional()
  @IsString()
  activepieces_run_id?: string;

  @ApiProperty({ 
    description: 'Execution record creation timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({ 
    description: 'Execution record last update timestamp',
    format: 'date-time',
    readOnly: true
  })
  @IsDateString()
  updated_at: string;
}

// DTO for creating a new workflow execution
export class CreateWorkflowExecutionDto {
  @ApiPropertyOptional({ 
    description: 'Trigger data that initiated the execution',
    type: 'object',
    additionalProperties: true,
    example: {
      user_id: 'uuid',
      file_id: 'uuid',
      form_data: { name: 'John Doe', email: 'john@example.com' }
    }
  })
  @IsOptional()
  @IsObject()
  trigger_data?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Execution context and variables',
    type: 'object',
    additionalProperties: true,
    example: {
      company_name: 'Acme Corp',
      environment: 'production'
    }
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

// DTO for updating workflow execution status
export class UpdateWorkflowExecutionDto {
  @ApiPropertyOptional({ 
    description: 'Workflow execution status',
    enum: WorkflowExecutionStatus
  })
  @IsOptional()
  @IsEnum(WorkflowExecutionStatus)
  status?: WorkflowExecutionStatus;

  @ApiPropertyOptional({ 
    description: 'Execution start timestamp',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  started_at?: string;

  @ApiPropertyOptional({ 
    description: 'Execution completion timestamp',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  completed_at?: string;

  @ApiPropertyOptional({ 
    description: 'Total execution duration in seconds'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_seconds?: number;

  @ApiPropertyOptional({ 
    description: 'Step execution details',
    type: [StepExecution]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepExecution)
  step_executions?: StepExecution[];

  @ApiPropertyOptional({ 
    description: 'Overall execution result',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  result?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Execution error details if failed',
    type: 'object',
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  error?: {
    message: string;
    code?: string;
    failed_step?: string;
    details?: Record<string, any>;
  };

  @ApiPropertyOptional({ 
    description: 'ActivePieces flow run ID'
  })
  @IsOptional()
  @IsString()
  activepieces_run_id?: string;
}

// Extended execution with template and studio details
export class WorkflowExecutionWithDetails extends WorkflowExecution {
  @ApiPropertyOptional({ 
    description: 'Workflow template details',
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      trigger_type: { type: 'string' },
    },
  })
  template?: {
    name: string;
    description?: string;
    trigger_type: string;
  };

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
    description: 'Trigger user details',
    type: 'object',
    properties: {
      full_name: { type: 'string' },
      email: { type: 'string', format: 'email' },
    },
  })
  triggered_by_user?: {
    full_name: string;
    email: string;
  };
}

// Execution analytics and metrics
export class WorkflowExecutionAnalytics {
  @ApiProperty({ description: 'Execution identifier', format: 'uuid' })
  execution_id: string;

  @ApiProperty({ description: 'Template name' })
  template_name: string;

  @ApiProperty({ description: 'Studio name' })
  studio_name: string;

  @ApiProperty({ description: 'Execution status' })
  status: WorkflowExecutionStatus;

  @ApiProperty({ description: 'Total duration in seconds' })
  duration_seconds: number;

  @ApiProperty({ description: 'Number of steps executed' })
  steps_executed: number;

  @ApiProperty({ description: 'Number of steps completed successfully' })
  steps_successful: number;

  @ApiProperty({ description: 'Number of steps failed' })
  steps_failed: number;

  @ApiProperty({ description: 'Step success rate percentage' })
  step_success_rate: number;

  @ApiPropertyOptional({ description: 'Bottleneck step (longest duration)' })
  bottleneck_step?: {
    step_id: string;
    duration_seconds: number;
    percentage_of_total: number;
  };

  @ApiPropertyOptional({ description: 'Most recent error if any' })
  last_error?: {
    step_id: string;
    message: string;
    timestamp: string;
  };

  @ApiProperty({ 
    description: 'Execution start timestamp',
    format: 'date-time'
  })
  started_at: string;

  @ApiPropertyOptional({ 
    description: 'Execution completion timestamp',
    format: 'date-time'
  })
  completed_at?: string;
}

// State machine transitions for workflow execution
export const WORKFLOW_STATUS_TRANSITIONS = {
  [WorkflowExecutionStatus.PENDING]: [
    WorkflowExecutionStatus.RUNNING,
    WorkflowExecutionStatus.CANCELLED,
  ],
  [WorkflowExecutionStatus.RUNNING]: [
    WorkflowExecutionStatus.PAUSED,
    WorkflowExecutionStatus.COMPLETED,
    WorkflowExecutionStatus.FAILED,
    WorkflowExecutionStatus.CANCELLED,
    WorkflowExecutionStatus.TIMEOUT,
  ],
  [WorkflowExecutionStatus.PAUSED]: [
    WorkflowExecutionStatus.RUNNING,
    WorkflowExecutionStatus.CANCELLED,
  ],
  [WorkflowExecutionStatus.COMPLETED]: [], // Terminal state
  [WorkflowExecutionStatus.FAILED]: [], // Terminal state
  [WorkflowExecutionStatus.CANCELLED]: [], // Terminal state
  [WorkflowExecutionStatus.TIMEOUT]: [], // Terminal state
} as const;

// Helper function to validate status transitions
export function isValidStatusTransition(
  currentStatus: WorkflowExecutionStatus,
  newStatus: WorkflowExecutionStatus,
): boolean {
  const allowedTransitions = WORKFLOW_STATUS_TRANSITIONS[currentStatus] as readonly WorkflowExecutionStatus[];
  return allowedTransitions.includes(newStatus);
}