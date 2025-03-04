import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '@prisma/client';

import { TaskIdDto } from './task-id.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto extends TaskIdDto {
  @ApiProperty({
    description: 'Task status should be a string of Task Status enum',
    enum: TaskStatus,
    example: 'IN_PROGRESS',
  })
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
