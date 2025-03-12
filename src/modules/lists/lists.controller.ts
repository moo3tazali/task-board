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

import { ListsService } from './lists.service';
import { CreateListDto, ListIdDto, UpdateListDto } from './dtos';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth, Permissions } from '../auth/decorators';
import { List, ListList } from './interfaces';
import { BoardIdDto } from '../boards/dtos';
import { PaginationDto } from 'src/common/dtos';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Controller('lists')
export class ListsController {
  constructor(
    private readonly listsService: ListsService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Create a new list in my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions('LIST_CREATE')
  @Post()
  public async createList(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() { title }: CreateListDto,
  ): Promise<List> {
    const createdList = await this.listsService.create({
      boardId,
      title,
    });

    this.notifications.notifiBoardMembers({
      boardId,
      userId,
      type: NotificationType.LIST_CREATED,
      data: createdList,
    });

    return createdList;
  }

  /**
   * Get a list of lists of my own board or the board i'm one of its members
   */
  @ApiBearerAuth()
  @Permissions()
  @Get('list')
  public async listsList(
    @Param() { boardId }: BoardIdDto,
    @Query() pagination: PaginationDto,
  ): Promise<ListList> {
    const [items, count] = await this.listsService.getList(
      boardId,
      pagination,
    );
    return {
      items,
      meta: { count, skip: pagination.skip, limit: pagination.limit },
    };
  }

  /**
   * Update a list's title of my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions('LIST_UPDATE')
  @Patch()
  public async updateList(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() updateListDto: UpdateListDto,
  ): Promise<List> {
    const updatedList = await this.listsService.update(updateListDto);

    this.notifications.notifiBoardMembers({
      boardId,
      userId,
      type: NotificationType.LIST_UPDATED,
      data: updatedList,
    });

    return updatedList;
  }

  /**
   * Get a single list of my own board or the board i'm one of its members
   */
  @ApiBearerAuth()
  @Permissions()
  @Get(':listId')
  public async getOneList(
    @Param() _: BoardIdDto,
    @Param() { listId }: ListIdDto,
  ): Promise<List> {
    return this.listsService.getOne(listId);
  }

  /**
   * Delete a list from my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions('LIST_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':listId')
  public async deleteList(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Param() { listId }: ListIdDto,
  ): Promise<void> {
    await this.listsService.delete(listId);

    this.notifications.notifiBoardMembers({
      boardId,
      userId,
      type: NotificationType.LIST_DELETED,
      data: { listId },
    });
  }
}
