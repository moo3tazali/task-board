import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ListsService } from './lists.service';
import { CreateListDto, ListIdDto, UpdateListDto } from './dtos';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../auth/decorators';
import { List, ListList } from './interfaces';
import { BoardIdDto } from '../boards/dtos';
import { PaginationDto } from 'src/common/dtos';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  /**
   * Create a new list in my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions('LIST_CREATE')
  @Post()
  public async createList(
    @Body() createListDto: CreateListDto,
  ): Promise<List> {
    return this.listsService.create(createListDto);
  }

  /**
   * Get a single list of my own board or the board i'm one of its members
   */
  @ApiBearerAuth()
  @Permissions()
  @Get()
  public async getOneList(
    @Query() _: BoardIdDto,
    @Query() { listId }: ListIdDto,
  ): Promise<List> {
    return this.listsService.getOne(listId);
  }

  /**
   * Get a list of lists of my own board or the board i'm one of its members
   */
  @ApiBearerAuth()
  @Permissions()
  @Get('list')
  public async listsList(
    @Query() { boardId }: BoardIdDto,
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
    @Body() updateListDto: UpdateListDto,
  ): Promise<List> {
    return this.listsService.update(updateListDto);
  }

  /**
   * Delete a list from my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions('LIST_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  public async deleteList(
    @Query() _: BoardIdDto,
    @Query() { listId }: ListIdDto,
  ): Promise<void> {
    await this.listsService.delete(listId);
  }
}
