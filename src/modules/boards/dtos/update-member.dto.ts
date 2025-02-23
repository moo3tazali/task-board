import { ApiProperty } from '@nestjs/swagger';
import { BoardPermission } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateMemberPermissionsrDto {
  /**
   * boardId should be a valid UUID
   * @example '6006b460-46b6-451b-b07d-59d15a38657f'
   */
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  boardId: string;

  /**
   * userId should be a valid UUID
   * @example '6006b460-46b6-451b-b07d-59d15a38657f'
   */
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;

  /**
   * permissions should be an array of BoardPermission enums
   */
  @ApiProperty({
    enum: BoardPermission,
    isArray: true,
    examples: ['MANAGE_MEMBERS', 'EDIT'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsEnum(BoardPermission, { each: true })
  permissions: BoardPermission[];
}
