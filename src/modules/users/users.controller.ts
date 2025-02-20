import { Controller, Get, NotFoundException } from '@nestjs/common';
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
  @Get('me')
  public async getProfile(
    @Auth('sub') id: string,
  ): Promise<UserProfile> {
    const user = await this.usersService.profile(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
