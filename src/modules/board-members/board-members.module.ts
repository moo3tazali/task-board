import { Module } from '@nestjs/common';

import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { RouterModule } from '@nestjs/core';

@Module({
  providers: [BoardMembersService],
  controllers: [BoardMembersController],
  imports: [
    RouterModule.register([
      {
        path: 'boards/:boardId',
        module: BoardMembersModule,
      },
    ]),
  ],
  exports: [BoardMembersService],
})
export class BoardMembersModule {}
