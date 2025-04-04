import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  /**
   * username should be at least 3 characters long and contain only alphanumeric characters and underscores
   * @example test
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'username must contain only alphanumeric characters and underscores',
  })
  username: string;

  /**
   * email should be a valid email address
   * @example test@test.com
   */
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  @IsEmail()
  email: string;

  /**
   * password should be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
   * @example Test@1234
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;
}
