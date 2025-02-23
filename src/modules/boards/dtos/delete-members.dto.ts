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
  @IsString({
    each: true,
    message: 'memberIds must be an array of a UUID',
  })
  @IsUUID(undefined, {
    each: true,
    message: 'memberIds must contain a valid UUID',
  })
  memberIds: string[];
}
