import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TaskIdDto } from './task-id.dto';

export class MoveTaskDto extends TaskIdDto {
  /**
   * listId should be a valid UUID
   * @example '6006b460-46b6-451b-b07d-59d15a38657f'
   */
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  listId: string;
}
