import { Module } from '@nestjs/common';

import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { BoardsService } from '../boards/boards.service';

@Module({
  providers: [ListsService, BoardsService],
  controllers: [ListsController],
})
export class ListsModule {}
