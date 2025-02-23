import { ApiPropertyOptional } from '@nestjs/swagger';
import { BoardPermission } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class AddMembersDto {
  /**
   * boardId should be a valid UUID
   * @example '6006b460-46b6-451b-b07d-59d15a38657f'
   */
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  boardId: string;

  /**
   * members should be an array objects containing userId and optional permissions array of BoardPermission enums (default: ['VIEW'])
   */
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MembersDto)
  members: MembersDto[];
}

export class MembersDto {
  /**
   * userId should be a valid UUID
   * @example '6006b460-46b6-451b-b07d-59d15a38657f'
   */
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;

  /**
   * permissions should be an array of BoardPermission enums (default: ['VIEW'])
   */
  @ApiPropertyOptional({
    enum: BoardPermission,
    isArray: true,
    examples: ['MANAGE_MEMBERS', 'EDIT'],
    default: ['VIEW'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(BoardPermission, { each: true })
  @ValidateIf((o: MembersDto) => o.permissions !== undefined)
  @Transform(({ value }: { value: BoardPermission[] }) =>
    Array.isArray(value) && value.length === 0 ? ['VIEW'] : value,
  )
  permissions?: BoardPermission[];
}
