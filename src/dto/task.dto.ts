import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed'])
  status?: string;

  @ApiProperty({ enum: ['low', 'medium', 'high'], default: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @ApiProperty({ required: true })
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ['pending', 'in_progress', 'completed'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed'])
  status?: string;

  @ApiProperty({ enum: ['low', 'medium', 'high'], required: false })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}

export class TaskResponseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: ['pending', 'in_progress', 'completed'] })
  @IsEnum(['pending', 'in_progress', 'completed'])
  status: string;

  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  @IsEnum(['low', 'medium', 'high'])
  priority: string;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  assignedToId?: string;

  @ApiProperty()
  createdById: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AssignTaskDto {
  @ApiProperty()
  @IsUUID()
  userId: string;
}

export class TaskQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number = 10;
}
