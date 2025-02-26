import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';

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
    private readonly prisma: PrismaExceptionsService,
  ) {}

  public async register(userDto: CreateUserDto): Promise<string> {
    const createdUser = await this.prisma.handle(() =>
      this.userService.createUser(userDto),
    );

    return this.generateToken(createdUser);
  }

  public async login(loginDto: LoginDto): Promise<string> {
    let user: User | null = null;

    const isEmail = loginDto.identifier.includes('@');

    if (isEmail) {
      user = await this.prisma.handle(() =>
        this.userService.findOne({
          email: loginDto.identifier,
        }),
      );
    } else {
      user = await this.prisma.handle(() =>
        this.userService.findOne({
          username: loginDto.identifier,
        }),
      );
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
