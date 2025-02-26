import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BoardPermission, BoardRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { Member, MemberWithPermissions } from './interfaces';
import { rolePermissions } from '../auth/constants';
import { PaginationDto } from 'src/common/dtos';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class BoardMembersService {
  constructor(private readonly db: PrismaService) {}

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

  public async addMembers(
    boardId: string,
    memberIds: string[],
  ): Promise<void> {
    try {
      await this.db.boardMember.createMany({
        data: memberIds.map((memberId) => ({ boardId, memberId })),
        skipDuplicates: true,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'one or more of the memberIds are invalid, your memberIds array need to contain a real user ids',
            {
              cause: 'memberIds',
            },
          );
        }
        throw error;
      }
      throw error;
    }
  }

  public async membersList(
    boardId: string,
    pagination: PaginationDto,
  ): Promise<[Member[], number]> {
    return Promise.all([
      this.db.boardMember.findMany({
        where: { boardId },
        select: this.membersSelect.select,
        orderBy: { createdAt: pagination.order },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.db.boardMember.count({
        where: { boardId },
      }),
    ]);
  }

  public async getOne(
    boardId: string,
    memberId: string,
  ): Promise<MemberWithPermissions | null> {
    return await this.db.boardMember.findUnique({
      where: { boardId_memberId: { boardId, memberId } },
      select: {
        ...this.membersSelect.select,
        permissions: true,
      },
    });
  }

  public async updateMemberRoles(
    boardId: string,
    memberId: string,
    roles: BoardRole[],
  ): Promise<Member> {
    const newPermissions = this.getPermissionsFromRoles(roles);

    try {
      const member = await this.db.boardMember.update({
        where: { boardId_memberId: { boardId, memberId } },
        data: {
          roles,
          permissions: newPermissions,
        },
        select: this.membersSelect.select,
      });

      return member;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'memberId not found in the board',
            { cause: 'memberId' },
          );
        }
        throw error;
      }
      throw error;
    }
  }

  public async updateMemberPermissions(
    boardId: string,
    memberId: string,
    permissions: BoardPermission[],
  ): Promise<Member> {
    try {
      const member = await this.db.boardMember.update({
        where: { boardId_memberId: { boardId, memberId } },
        data: {
          permissions,
        },
        select: this.membersSelect.select,
      });

      return member;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'memberId not found in the board',
            { cause: 'memberId' },
          );
        }
        throw error;
      }
      throw error;
    }
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

  private getPermissionsFromRoles(
    roles: BoardRole[],
  ): BoardPermission[] {
    return [
      ...new Set(roles.flatMap((role) => rolePermissions[role])),
    ];
  }
}
