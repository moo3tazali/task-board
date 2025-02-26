import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { BoardIdDto } from 'src/modules/boards/dtos';

export class CreateListDto extends BoardIdDto {
  /**
   * title should be a string between 1 and 255 characters long
   * @example 'Todo List'
   */
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  title: string;
}
