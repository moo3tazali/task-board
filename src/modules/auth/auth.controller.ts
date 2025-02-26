import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { Public } from './decorators';
import { LoginResponse } from './interfaces';
import { AuthService } from './auth.service';
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
    const accessToken =
      await this.authService.register(createUserDto);

    return { accessToken };
  }
}
