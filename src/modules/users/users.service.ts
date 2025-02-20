import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserProfile } from './interfaces';

@Injectable()
export class UsersService {
  constructor(private readonly userService: UserService) {}

  public async profile(id: string): Promise<UserProfile | null> {
    return this.userService.findById(id);
  }
}
