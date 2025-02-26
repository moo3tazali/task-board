import { Injectable } from '@nestjs/common';
import { Board } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { BoardMembers } from './interfaces';
import { PaginationDto } from 'src/common/dtos';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';

@Injectable()
export class BoardsService {
  constructor(
    private readonly db: PrismaService,
    private readonly prisma: PrismaExceptionsService,
  ) {}

  private membersSelect = {
    select: {
      boardId: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarPath: true,
        },
      },
      roles: true,
      createdAt: true,
      updatedAt: true,
    },
  };

  public async create(
    ownerId: string,
    dto: {
      title: string;
      description: string;
    },
  ): Promise<Board> {
    return this.prisma.handle<Board>(() =>
      this.db.board.create({
        data: {
          ownerId,
          ...dto,
        },
      }),
    );
  }

  public async getList(
    userId: string,
    pagination: PaginationDto,
  ): Promise<[Board[], number]> {
    const where = {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { memberId: userId },
          },
        },
      ],
    };

    return this.prisma.handle(() =>
      Promise.all([
        this.db.board.findMany({
          where,
          orderBy: { createdAt: pagination.order },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        this.db.board.count({
          where,
        }),
      ]),
    );
  }

  public async getOne(
    boardId: string,
    userId: string,
  ): Promise<BoardMembers | null> {
    return this.prisma.handle(() =>
      this.db.board.findFirst({
        where: {
          id: boardId,
          OR: [
            { ownerId: userId },
            { members: { some: { memberId: userId } } },
          ],
        },
        include: {
          members: this.membersSelect,
        },
      }),
    );
  }

  public async update(
    boardId: string,
    updatedDto: {
      title?: string;
      description?: string;
    },
  ): Promise<Board> {
    return this.prisma.handle(() =>
      this.db.board.update({
        where: { id: boardId },
        data: updatedDto,
      }),
    );
  }

  public async delete(boardId: string): Promise<void> {
    await this.prisma.handle(() =>
      this.db.board.delete({ where: { id: boardId } }),
    );
  }
}
