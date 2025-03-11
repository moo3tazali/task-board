import { Global, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  providers: [NotificationsService, NotificationsGateway],
  controllers: [NotificationsController],
  imports: [
    UserModule,
    RouterModule.register([
      {
        path: 'user',
        module: NotificationsModule,
      },
    ]),
  ],
})
export class NotificationsModule {}
