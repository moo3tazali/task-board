import { Module } from '@nestjs/common';

import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { RouterModule } from '@nestjs/core';

@Module({
  providers: [ListsService],
  controllers: [ListsController],
  imports: [
    RouterModule.register([
      {
        path: 'boards/:boardId',
        module: ListsModule,
      },
    ]),
  ],
})
export class ListsModule {}
