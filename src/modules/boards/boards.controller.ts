import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { BoardPermission } from '@prisma/client';

import { Auth } from '../auth/decorators';
import { BoardsService } from './boards.service';
import {
  AddMembersDto,
  BoardIdDto,
  CreateBoardDto,
  MembersDto,
} from './dtos';
import { Board, BoardList, BoardMembers, Member } from './interfaces';
import { PaginationDto } from 'src/common/dtos';
import { UpdateBoardDto } from './dtos/update-board.dto';

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
    return this.boardsService.create({
      ...createDto,
      ownerId: userId,
    });
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
    const board = await this.getBoardOrFail(boardId, userId);

    return board;
  }

  /**
   * Update a board
   */
  @ApiBearerAuth()
  @Patch(':boardId')
  public async updateBoard(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() updatedDto: UpdateBoardDto,
  ): Promise<Board> {
    const board = await this.getBoardOrFail(boardId, userId);

    this.verifyBoardPermissions(board, userId, ['EDIT']);

    return this.boardsService.update(boardId, updatedDto);
  }

  /**
   * Delete a board
   */
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':boardId')
  public async deleteBoard(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
  ): Promise<void> {
    const board = await this.getBoardOrFail(boardId, userId);

    this.verifyBoardPermissions(board, userId, ['DELETE']);

    await this.boardsService.delete(boardId);
  }

  /**
   * Add members to my own board or a board you have permission to manage
   */
  @ApiBearerAuth()
  @Post('members')
  public async getBoardMembers(
    @Auth('id') userId: string,
    @Body() membersDto: AddMembersDto,
  ): Promise<Member[]> {
    const { boardId, members } = membersDto;

    const board = await this.getBoardOrFail(boardId, userId);

    this.verifyBoardPermissions(board, userId, ['MANAGE_MEMBERS']);

    const uniqueValues = this.getUniqueMembers(
      members,
      board.members,
    );

    if (!uniqueValues.length) return board.members;

    return this.boardsService.addMembers(boardId, uniqueValues);
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

  private verifyBoardPermissions(
    board: BoardMembers,
    userId: string,
    permissions: BoardPermission[],
  ): void {
    if (board.ownerId === userId) return;

    const userPermission =
      board.members.find((member) => member.user.id === userId)
        ?.permissions || [];

    const hasPermission = permissions.every((permission) =>
      userPermission.includes(permission),
    );

    if (!hasPermission)
      throw new ForbiddenException(
        'Unauthorized to perform this action on this board',
      );
  }

  private getUniqueMembers(
    newMembers: MembersDto[],
    existingMembers: Member[],
  ): MembersDto[] {
    const UniqueExistingMembersIds = new Set(
      existingMembers.map((member) => member.user.id),
    );

    return newMembers.filter(
      (member) => !UniqueExistingMembersIds.has(member.userId),
    );
  }
}
