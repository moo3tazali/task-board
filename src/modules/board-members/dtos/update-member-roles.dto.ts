import { ApiProperty } from '@nestjs/swagger';
import { BoardRole } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateMemberRolesDto {
  /**
   * boardId should be a valid UUID
   * @example '6006b460-46b6-451b-b07d-59d15a38657f'
   */
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  memberId: string;

  /**
   * roles should be an array of BoardRole enums
   */
  @ApiProperty({
    enum: BoardRole,
    isArray: true,
    example: [BoardRole.MANAGER, BoardRole.MEMBER],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(BoardRole, { each: true })
  roles: BoardRole[];
}
