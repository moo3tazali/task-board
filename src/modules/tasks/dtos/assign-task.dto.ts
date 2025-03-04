import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { TaskIdDto } from './task-id.dto';

export class AssignTaskDto extends TaskIdDto {
  /**
   * membersIds should be an array of a vaild UUID
   * @example ['8640e361-9f0a-462e-901a-58465ecb29ff']
   */
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  membersIds: string[];
}
