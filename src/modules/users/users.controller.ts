import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Auth } from '../auth/decorators';
import { UsersService } from './users.service';
import { UserProfile } from './interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get user profile
   */
  @ApiBearerAuth()
  @Get('profile')
  public getProfile(@Auth() user: Auth): UserProfile {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarPath: user.avatarPath,
      roles: user.roles,
    } satisfies UserProfile;
  }
}
