import { Injectable } from '@nestjs/common';
import { BoardPermission, BoardRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';
import { Member, MemberWithPermissions } from './interfaces';
import { rolePermissions } from '../auth/constants';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class BoardMembersService {
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

  public async addMembers(
    boardId: string,
    memberIds: string[],
  ): Promise<void> {
    await this.prisma.handle(
      () =>
        this.db.boardMember.createMany({
          data: memberIds.map((memberId) => ({ boardId, memberId })),
          skipDuplicates: true,
        }),
      {
        field: 'memberIds',
        message:
          'one or more of the memberIds are invalid, your memberIds array need to contain a real user ids',
      },
    );
  }

  public async membersList(
    boardId: string,
    pagination: PaginationDto,
  ): Promise<[Member[], number]> {
    return this.prisma.handle(() =>
      Promise.all([
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
      ]),
    );
  }

  public async getOne(
    boardId: string,
    memberId: string,
  ): Promise<MemberWithPermissions | null> {
    return this.prisma.handle(() =>
      this.db.boardMember.findUnique({
        where: { boardId_memberId: { boardId, memberId } },
        select: {
          ...this.membersSelect.select,
          permissions: true,
        },
      }),
    );
  }

  public async updateMemberRoles(
    boardId: string,
    memberId: string,
    roles: BoardRole[],
  ): Promise<Member> {
    const newPermissions = this.getPermissionsFromRoles(roles);

    return this.prisma.handle(
      () =>
        this.db.boardMember.update({
          where: { boardId_memberId: { boardId, memberId } },
          data: {
            roles,
            permissions: newPermissions,
          },
          select: this.membersSelect.select,
        }),
      {
        field: 'memberId',
        message: 'member not found in the board',
      },
    );
  }

  public async updateMemberPermissions(
    boardId: string,
    memberId: string,
    permissions: BoardPermission[],
  ): Promise<Member> {
    return this.prisma.handle(
      () =>
        this.db.boardMember.update({
          where: { boardId_memberId: { boardId, memberId } },
          data: {
            permissions,
          },
          select: this.membersSelect.select,
        }),
      {
        field: 'memberId',
        message: 'member not found in the board',
      },
    );
  }

  public async deleteMembers(
    boardId: string,
    memberIds: string[],
  ): Promise<void> {
    await this.prisma.handle(() =>
      this.db.boardMember.deleteMany({
        where: {
          boardId,
          memberId: { in: memberIds },
        },
      }),
    );
  }

  private getPermissionsFromRoles(
    roles: BoardRole[],
  ): BoardPermission[] {
    return [
      ...new Set(roles.flatMap((role) => rolePermissions[role])),
    ];
  }
}
