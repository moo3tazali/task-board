import { Injectable } from '@nestjs/common';
import { List } from '@prisma/client';

import { PaginationDto } from 'src/common/dtos';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';

@Injectable()
export class ListsService {
  constructor(
    private readonly db: PrismaService,
    private readonly prisma: PrismaExceptionsService,
  ) {}

  public async create(createDto: {
    boardId: string;
    title: string;
  }): Promise<List> {
    return this.prisma.handle<List>(
      () =>
        this.db.list.create({
          data: createDto,
        }),
      {
        field: 'title',
      },
    );
  }

  public async getList(
    boardId: string,
    pagination: PaginationDto,
  ): Promise<[List[], number]> {
    return this.prisma.handle(() =>
      Promise.all([
        this.db.list.findMany({
          where: { boardId },
          orderBy: { createdAt: pagination.order },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        this.db.list.count({
          where: { boardId },
        }),
      ]),
    );
  }

  public async getOne(listId: string): Promise<List> {
    return this.prisma.handle(() =>
      this.db.list.findUniqueOrThrow({
        where: { id: listId },
      }),
    );
  }

  public async update(updatedDto: {
    title: string;
    listId: string;
  }): Promise<List> {
    return this.prisma.handle<List>(() =>
      this.db.list.update({
        where: {
          id: updatedDto.listId,
        },
        data: {
          title: updatedDto.title,
        },
      }),
    );
  }

  public async delete(listId: string): Promise<void> {
    await this.prisma.handle(() =>
      this.db.list.delete({ where: { id: listId } }),
    );
  }
}
