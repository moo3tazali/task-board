import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  providers: [NotificationsService],
  controllers: [NotificationsController],
  imports: [
    RouterModule.register([
      {
        path: 'user',
        module: NotificationsModule,
      },
    ]),
  ],
})
export class NotificationsModule {}
