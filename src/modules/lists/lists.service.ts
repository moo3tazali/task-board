import { Injectable } from '@nestjs/common';
import { List } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos';
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
    return this.prisma.handle<List>(() =>
      this.db.list.create({
        data: createDto,
      }),
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

  public async getOne(listId: string): Promise<List | null> {
    return this.prisma.handle(() =>
      this.db.list.findUnique({
        where: { id: listId },
      }),
    );
  }

  public async update(
    listId: string,
    updatedDto: { title: string },
  ): Promise<List> {
    return this.prisma.handle<List>(() =>
      this.db.list.update({
        where: { id: listId },
        data: updatedDto,
      }),
    );
  }

  public async delete(listId: string): Promise<void> {
    await this.prisma.handle(() =>
      this.db.list.delete({ where: { id: listId } }),
    );
  }
}
