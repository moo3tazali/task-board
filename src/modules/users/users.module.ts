import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UserModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
