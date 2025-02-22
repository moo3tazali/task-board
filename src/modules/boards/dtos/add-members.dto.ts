import { ApiPropertyOptional } from '@nestjs/swagger';
import { BoardPermission } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class AddMembersDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  boardId: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MembersDto)
  members: MembersDto[];
}

export class MembersDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    enum: BoardPermission,
    isArray: true,
    examples: ['MANAGE_MEMBERS', 'EDIT'],
    default: ['VIEW'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(BoardPermission, { each: true })
  permissions?: BoardPermission[];
}
