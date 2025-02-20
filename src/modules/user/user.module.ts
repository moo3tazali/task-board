import { Module } from '@nestjs/common';

import { PasswordService } from './password/password.service';
import { UserService } from './user.service';

@Module({
  providers: [UserService, PasswordService],
  exports: [UserService, PasswordService],
})
export class UserModule {}
