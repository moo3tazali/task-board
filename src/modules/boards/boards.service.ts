import { Injectable } from '@nestjs/common';
import { Board, BoardRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';
import { ROLE_PERMISSIONS } from '../auth/constants';

@Injectable()
export class BoardsService {
  constructor(
    private readonly db: PrismaService,
    private readonly prisma: PrismaExceptionsService,
  ) {}

  public async create(
    memberId: string,
    dto: {
      title: string;
      description: string;
    },
  ): Promise<Board> {
    return this.prisma.handle<Board>(() =>
      this.db.board.create({
        data: {
          ...dto,
          members: {
            create: {
              memberId,
              roles: [BoardRole.OWNER],
              permissions: ROLE_PERMISSIONS[BoardRole.OWNER],
            },
          },
        },
      }),
    );
  }

  public async getList(
    memberId: string,
    pagination: PaginationDto,
  ): Promise<[Board[], number]> {
    return this.prisma.handle(() =>
      Promise.all([
        this.db.board.findMany({
          where: { members: { some: { memberId } } },
          orderBy: { createdAt: pagination.order },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        this.db.board.count({
          where: { members: { some: { memberId } } },
        }),
      ]),
    );
  }

  public async getOne(boardId: string): Promise<Board> {
    return this.prisma.handle(() =>
      this.db.board.findUniqueOrThrow({
        where: {
          id: boardId,
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
