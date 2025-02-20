import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  /**
   * identifier can be either an email or a username
   * @example exampleUser
   */
  @IsNotEmpty()
  @IsString()
  @ValidateIf((o: LoginDto) => o.identifier.includes('@'))
  @IsEmail()
  @ValidateIf((o: LoginDto) => !o.identifier.includes('@'))
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'identifier is invalid' })
  identifier: string;

  /**
   * password used to authenticate the user
   * @example
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}
