import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BoardIdDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  boardId: string;
}
