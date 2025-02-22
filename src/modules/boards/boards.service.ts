import { ConflictException, Injectable } from '@nestjs/common';
import { Board, BoardPermission } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BoardMembers, Member } from './interfaces';

@Injectable()
export class BoardsService {
  constructor(private readonly db: PrismaService) {}

  public async create(dto: {
    title: string;
    description: string;
    ownerId: string;
  }): Promise<Board> {
    try {
      const createdBoard = await this.db.board.create({
        data: {
          ...dto,
          members: {
            create: {
              userId: dto.ownerId,
              permissions: [
                'VIEW',
                'EDIT',
                'DELETE',
                'COMMENT',
                'MANAGE_MEMBERS',
              ],
              isOwner: true,
            },
          },
        },
      });

      return createdBoard;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('title already exists');
        }
        throw error;
      }

      throw error;
    }
  }

  public async getList(
    userId: string,
    pagination: {
      skip: number;
      limit: number;
      order: 'asc' | 'desc';
    },
  ): Promise<[Board[], number]> {
    return Promise.all([
      this.db.board.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
        orderBy: { createdAt: pagination.order },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.db.board.count({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);
  }

  public async getOne(
    boardId: string,
    userId: string,
  ): Promise<BoardMembers | null> {
    return await this.db.board.findUnique({
      where: {
        id: boardId,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: this.membersSelect,
      },
    });
  }

  public async update(
    boardId: string,
    updatedDto: {
      title?: string;
      description?: string;
    },
  ): Promise<Board> {
    return await this.db.board.update({
      where: { id: boardId },
      data: updatedDto,
    });
  }

  public async delete(boardId: string): Promise<void> {
    await this.db.board.delete({ where: { id: boardId } });
  }

  public async addMembers(
    boardId: string,
    dto: { userId: string; permissions?: BoardPermission[] }[],
  ): Promise<Member[]> {
    const updatedBoard = await this.db.board.update({
      where: { id: boardId },
      data: {
        members: {
          createMany: {
            data: dto,
          },
        },
      },
      include: { members: this.membersSelect },
    });

    return updatedBoard.members;
  }

  public async updatePermissions(
    boardId: string,
    dto: { userId: string; permissions: BoardPermission[] },
  ) {
    return await this.db.board.update({
      where: { id: boardId },
      data: {
        members: {
          update: {
            where: {
              boardId_userId: {
                boardId,
                userId: dto.userId,
              },
            },
            data: {
              permissions: dto.permissions,
            },
          },
        },
      },
      include: { members: true },
    });
  }

  public async deleteMembers(
    boardId: string,
    userIds: string[],
  ): Promise<Board> {
    return await this.db.board.update({
      where: { id: boardId },
      data: {
        members: {
          deleteMany: {
            userId: { in: userIds },
          },
        },
      },
      include: { members: true },
    });
  }

  membersSelect = {
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
      permissions: true,
      isOwner: true,
      createdAt: true,
      updatedAt: true,
    },
  };
}
