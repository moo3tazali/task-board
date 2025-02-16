import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { CreateUserDto, LoginDto } from '../dto';
import { UserExistException } from '../exceptions';
import { User } from '../entities';
import { PasswordService } from '../password/password.service';
import { Payload } from '../model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  public async register(userDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersService.findOneByEmail(
      userDto.email,
    );

    if (existingUser) {
      throw new UserExistException();
    }

    const user = await this.usersService.createUser(userDto);

    return user;
  }

  public async login(loginDto: LoginDto): Promise<string> {
    const isEmail = loginDto.identifier.includes('@');

    let user: User | null = null;

    if (isEmail) {
      user = await this.usersService.findOneByEmail(
        loginDto.identifier,
      );
    }

    if (!isEmail) {
      user = await this.usersService.findOneByUsername(
        loginDto.identifier,
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
      avatarPath: '',
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }
}
