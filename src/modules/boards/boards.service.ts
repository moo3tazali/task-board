import { ConflictException, Injectable } from '@nestjs/common';
import { Board, BoardPermission, BoardRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Member } from '../board-members/interfaces';
import { BoardMembers } from './interfaces';
import { rolePermissions } from '../auth/constants';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class BoardsService {
  constructor(private readonly db: PrismaService) {}

  public async create(
    ownerId: string,
    dto: {
      title: string;
      description: string;
    },
  ): Promise<Board> {
    try {
      const createdBoard = await this.db.board.create({
        data: {
          ownerId,
          ...dto,
        },
      });

      return createdBoard;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('title already exists', {
            cause: 'title',
          });
        }
        throw error;
      }

      throw error;
    }
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

    return Promise.all([
      this.db.board.findMany({
        where,
        orderBy: { createdAt: pagination.order },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.db.board.count({
        where,
      }),
    ]);
  }

  public async getOne(
    boardId: string,
    userId: string,
  ): Promise<BoardMembers | null> {
    return await this.db.board.findFirst({
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
    });
  }

  public async update(
    boardId: string,
    updatedDto: {
      title?: string;
      description?: string;
    },
  ): Promise<Board> {
    try {
      return await this.db.board.update({
        where: { id: boardId },
        data: updatedDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('title already exists', {
            cause: 'title',
          });
        }
        throw error;
      }

      throw error;
    }
  }

  public async delete(boardId: string): Promise<void> {
    await this.db.board.delete({ where: { id: boardId } });
  }

  public async addMembers(
    boardId: string,
    memberIds: string[],
  ): Promise<void> {
    await this.db.boardMember.createMany({
      data: memberIds.map((memberId) => ({ boardId, memberId })),
      skipDuplicates: true,
    });
  }

  public async updateMemberRoles(
    boardId: string,
    memberId: string,
    rolesDto: BoardRole[],
  ): Promise<Member> {
    const newPermissions = this.getPermissionsFromRoles(rolesDto);

    const member = await this.db.boardMember.update({
      where: { boardId_memberId: { boardId, memberId } },
      data: {
        roles: rolesDto,
        permissions: newPermissions,
      },
      include: this.membersSelect.select,
    });

    return member;
  }

  public async updateMemberPermissions(
    boardId: string,
    memberId: string,
    permissionsDto: BoardPermission[],
  ): Promise<Member> {
    const member = await this.db.boardMember.update({
      where: { boardId_memberId: { boardId, memberId } },
      data: {
        permissions: permissionsDto,
      },
      include: this.membersSelect.select,
    });

    return member;
  }

  public async deleteMembers(
    boardId: string,
    memberIds: string[],
  ): Promise<void> {
    await this.db.boardMember.deleteMany({
      where: {
        boardId,
        memberId: { in: memberIds },
      },
    });
  }

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

  private getPermissionsFromRoles(
    roles: BoardRole[],
  ): BoardPermission[] {
    return [
      ...new Set(roles.flatMap((role) => rolePermissions[role])),
    ];
  }
}
