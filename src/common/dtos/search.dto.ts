import { IsOptional, IsString, Length } from 'class-validator';

export class SearchDto {
  @IsOptional()
  @IsString()
  @Length(3, 100)
  search?: string;
}
