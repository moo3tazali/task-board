import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';

import { Public } from './decorators';
import { LoginResponse } from './interfaces';
import { AuthService } from './auth.service';
import { UserExistException } from './exceptions';
import { CreateUserDto, LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login an existing user
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() loginDto: LoginDto,
  ): Promise<LoginResponse> {
    const accessToken = await this.authService.login(loginDto);
    return { accessToken };
  }

  /**
   * Create a new user
   */
  @Public()
  @Post('register')
  public async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<LoginResponse> {
    try {
      const accessToken =
        await this.authService.register(createUserDto);

      return { accessToken };
    } catch (error) {
      if (error instanceof UserExistException) {
        throw new ConflictException(error.message);
      }

      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw error;
    }
  }
}
