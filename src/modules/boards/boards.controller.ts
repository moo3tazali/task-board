import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Auth, Permissions } from '../auth/decorators';
import { BoardsService } from './boards.service';
import { BoardIdDto, CreateBoardDto, UpdateBoardDto } from './dtos';
import { Board, BoardList } from './interfaces';
import { PaginationDto } from 'src/common/dtos';
import { BoardMembers } from './interfaces';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  /**
   * Create a new board
   */
  @ApiBearerAuth()
  @Post()
  public async createBoard(
    @Auth('id') userId: string,
    @Body() createDto: CreateBoardDto,
  ): Promise<Board> {
    return this.boardsService.create(userId, createDto);
  }

  /**
   * Get user's board list
   */
  @ApiBearerAuth()
  @Get('list')
  public async getBoardList(
    @Auth('id') userId: string,
    @Query() pagination: PaginationDto,
  ): Promise<BoardList> {
    const [items, count] = await this.boardsService.getList(
      userId,
      pagination,
    );

    return {
      items,
      meta: {
        count,
        skip: pagination.skip,
        limit: pagination.limit,
      },
    };
  }

  /**
   * Get a single board
   */
  @ApiBearerAuth()
  @Get(':boardId')
  public async getBoard(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
  ): Promise<Board> {
    return this.getBoardOrFail(boardId, userId);
  }

  /**
   * Update a board
   */
  @ApiBearerAuth()
  @Permissions('BOARD_UPDATE')
  @Patch(':boardId')
  public async updateBoard(
    @Param() { boardId }: BoardIdDto,
    @Body() updatedDto: UpdateBoardDto,
  ): Promise<Board> {
    return this.boardsService.update(boardId, updatedDto);
  }

  /**
   * Delete a board
   */
  @ApiBearerAuth()
  @Permissions('BOARD_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':boardId')
  public async deleteBoard(
    @Param() { boardId }: BoardIdDto,
  ): Promise<void> {
    await this.boardsService.delete(boardId);
  }

  //
  //
  // Private methods
  private async getBoardOrFail(
    boardId: string,
    userId: string,
  ): Promise<BoardMembers> {
    const board = await this.boardsService.getOne(boardId, userId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }
}
