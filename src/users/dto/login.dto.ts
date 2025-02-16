import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ValidateIf((o: LoginDto) => o.identifier.includes('@'))
  @IsEmail()
  @ValidateIf((o: LoginDto) => !o.identifier.includes('@'))
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'identifier is invalid' })
  identifier: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
