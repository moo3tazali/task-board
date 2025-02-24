import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { BoardIdDto } from 'src/modules/boards/dtos';

export class AddMembersDto extends BoardIdDto {
  /**
   * Array of memberIds should be valid UUIDs
   */
  @ApiProperty({
    isArray: true,
    type: String,
    example: [
      '6006b460-46b6-451b-b07d-59d15a38657f',
      '6006b460-46b6-451b-b07d-59d15a386580',
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  membersIds: string[];
}
