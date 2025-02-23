import { Injectable } from '@nestjs/common';
import { List } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class ListsService {
  constructor(private readonly db: PrismaService) {}

  public async create(createDto: {
    boardId: string;
    title: string;
  }): Promise<List> {
    return await this.db.list.create({
      data: createDto,
    });
  }

  public async getList(
    boardId: string,
    pagination: PaginationDto,
  ): Promise<List[]> {
    return await this.db.list.findMany({
      where: { boardId },
      orderBy: { createdAt: pagination.order },
      skip: pagination.skip,
      take: pagination.limit,
    });
  }

  public async getOne(listId: string): Promise<List | null> {
    return await this.db.list.findUnique({
      where: { id: listId },
    });
  }

  public async update(
    listId: string,
    updatedDto: { title: string },
  ): Promise<List> {
    return await this.db.list.update({
      where: { id: listId },
      data: updatedDto,
    });
  }

  public async delete(listId: string): Promise<void> {
    await this.db.list.delete({ where: { id: listId } });
  }
}
