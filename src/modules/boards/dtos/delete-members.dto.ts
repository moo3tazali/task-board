import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class DeleteMembersDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  boardId: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, {
    each: true,
    message: 'memberIds must contain a valid UUID',
  })
  memberIds: string[];
}
