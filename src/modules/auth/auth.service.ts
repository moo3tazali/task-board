import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { Payload } from './interfaces';
import { UserService } from '../user/user.service';
import { PasswordService } from '../user/password/password.service';
import { CreateUserDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  public async register(userDto: CreateUserDto): Promise<string> {
    try {
      const createdUser = await this.userService.createUser(userDto);

      return this.generateToken(createdUser);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const causes = (error.meta?.target as string[]) || [];
          const fields = Object.keys(userDto);
          const cause =
            causes.find((cause) => fields.includes(cause)) || '';

          throw new ConflictException('User already exist', {
            cause,
          });
        }
      }

      throw error;
    }
  }

  public async login(loginDto: LoginDto): Promise<string> {
    let user: User | null = null;

    const isEmail = loginDto.identifier.includes('@');

    if (isEmail) {
      user = await this.userService.findOne({
        email: loginDto.identifier,
      });
    } else {
      user = await this.userService.findOne({
        username: loginDto.identifier,
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.verify(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User): string {
    const payload: Payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      avatarPath: user.avatarPath || '',
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }
}
