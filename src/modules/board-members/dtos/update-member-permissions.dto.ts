import { ApiProperty } from '@nestjs/swagger';
import { BoardPermission } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateMemberPermissionsDto {
  /**
   * boardId should be a valid UUID
   * @example '6006b460-46b6-451b-b07d-59d15a38657f'
   */
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  memberId: string;

  /**
   * permissions should be an array of BoardPermission enums
   */
  @ApiProperty({
    enum: BoardPermission,
    isArray: true,
    example: [
      BoardPermission.TASK_CREATE,
      BoardPermission.LIST_CREATE,
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(BoardPermission, { each: true })
  permissions: BoardPermission[];
}
