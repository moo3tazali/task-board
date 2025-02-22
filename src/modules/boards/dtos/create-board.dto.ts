import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateBoardDto {
  /**
   * title should be unique per user and has at least 3 characters long and contain only alphanumeric characters and spaces
   * @example 'My Board'
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title: string;

  /**
   * description should be at least 10 characters long
   * @example 'This is a description of my board'
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description: string;
}
