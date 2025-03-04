import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { TaskIdDto } from './task-id.dto';
import { IsFutureDate } from 'src/common/validators';

export class UpdateTaskDto extends TaskIdDto {
  /**
   * Task title
   * @example 'fix something'
   */
  @IsNotEmpty()
  @IsString()
  @Length(3, 255)
  title?: string;

  /**
   * Task description
   * @example 'This task needs to be completed by tomorrow'
   */
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  /**
   * Task due date
   * @example '2025-03-20T15:00:00.000Z'
   */
  @IsOptional()
  @IsISO8601({ strict: true })
  @IsFutureDate()
  dueDate?: string;
}
