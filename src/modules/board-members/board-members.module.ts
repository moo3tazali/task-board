import { Module } from '@nestjs/common';

import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';

@Module({
  providers: [BoardMembersService],
  controllers: [BoardMembersController],
})
export class BoardMembersModule {}
