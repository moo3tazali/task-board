import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class DeleteMembersDto {
  @IsNotEmpty()
  @ValidateIf(
    (obj: DeleteMembersDto) => typeof obj.memberIds === 'string',
  )
  @IsString()
  @IsUUID()
  @Transform(({ value }: { value: string | string[] }) =>
    typeof value === 'string' ? [value] : value,
  )
  @ValidateIf((obj: DeleteMembersDto) => Array.isArray(obj.memberIds))
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, {
    each: true,
    message: 'memberIds must contain a valid UUID',
  })
  memberIds: string[];
}
