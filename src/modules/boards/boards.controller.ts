import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BoardPermission } from '@prisma/client';

import { Auth, Permissions } from '../auth/decorators';
import { BoardsService } from './boards.service';
import { BoardIdDto, CreateBoardDto, UpdateBoardDto } from './dtos';
import { Board, BoardList } from './interfaces';
import { PaginationDto } from 'src/common/dtos';

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
   * Get list of my own boards or boards that i'm a member of it.
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
  @Permissions()
  @Get(':boardId')
  public async getBoard(
    @Param() { boardId }: BoardIdDto,
  ): Promise<Board> {
    return this.boardsService.getOne(boardId);
  }

  /**
   * Update a board
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.BOARD_UPDATE)
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
  @Permissions(BoardPermission.BOARD_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':boardId')
  public async deleteBoard(
    @Param() { boardId }: BoardIdDto,
  ): Promise<void> {
    await this.boardsService.delete(boardId);
  }
}
