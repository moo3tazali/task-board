import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateListDto {
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
