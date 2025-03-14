import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateLabelDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
    return value as string;
  })
  name: string;
}
