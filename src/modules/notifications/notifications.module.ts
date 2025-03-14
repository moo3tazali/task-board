import { Global, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { UserModule } from '../user/user.module';
import { BoardMembersService } from '../board-members/board-members.service';
import { TasksService } from '../tasks/tasks.service';

@Global()
@Module({
  providers: [
    NotificationsService,
    NotificationsGateway,
    BoardMembersService,
    TasksService,
  ],
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
  exports: [NotificationsService],
})
export class NotificationsModule {}
