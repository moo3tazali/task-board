import { Controller, NotFoundException } from '@nestjs/common';

import { ListsService } from './lists.service';
import { BoardsService } from '../boards/boards.service';

@Controller('lists')
export class ListsController {
  constructor(
    private readonly listsService: ListsService,
    private readonly boardsService: BoardsService,
  ) {}

  //
  //
  // Private methods
  private async verifyBoardAccess(
    boardId: string,
    userId: string,
  ): Promise<void> {
    const board = await this.boardsService.getOne(boardId, userId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId === userId) return;
  }
}
