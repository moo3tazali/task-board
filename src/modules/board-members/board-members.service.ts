import { Injectable } from '@nestjs/common';
import {
  BoardMember,
  BoardPermission,
  BoardRole,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';
import { Member, MemberWithPermissions } from './interfaces';
import { ROLE_PERMISSIONS } from '../auth/constants';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class BoardMembersService {
  constructor(
    private readonly db: PrismaService,
    private readonly prisma: PrismaExceptionsService,
  ) {}

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
          select: {
            boardId: true,
            memberId: true,
            roles: true,
            createdAt: true,
            updatedAt: true,
            user: {
              omit: {
                passwordHash: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
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

  public async getMembersIds(
    boardId: string,
  ): Promise<{ memberId: string }[]> {
    return this.prisma.handle(() =>
      this.db.boardMember.findMany({
        where: { boardId },
        select: {
          memberId: true,
        },
      }),
    );
  }

  public async getOne(
    boardId: string,
    memberId: string,
  ): Promise<MemberWithPermissions> {
    return this.prisma.handle(() =>
      this.db.boardMember.findUniqueOrThrow({
        where: { memberId_boardId: { boardId, memberId } },
        select: {
          boardId: true,
          memberId: true,
          roles: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
          user: {
            omit: {
              passwordHash: true,
              roles: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
    );
  }

  public async getMemberRole(
    boardId: string,
    memberId: string,
  ): Promise<BoardRole[]> {
    const member = await this.prisma.handle(() =>
      this.db.boardMember.findUniqueOrThrow({
        where: { memberId_boardId: { boardId, memberId } },
        select: {
          roles: true,
        },
      }),
    );

    return member.roles;
  }

  public async getBoardOwnerId(boardId: string): Promise<string> {
    return (
      await this.prisma.handle(() =>
        this.db.boardMember.findFirstOrThrow({
          where: { boardId, roles: { has: BoardRole.OWNER } },
          select: {
            memberId: true,
          },
        }),
      )
    )?.memberId;
  }

  public async updateMemberRoles(
    boardId: string,
    memberId: string,
    roles: BoardRole[],
  ): Promise<BoardMember> {
    const newPermissions = this.getPermissionsFromRoles(roles);

    return this.prisma.handle(
      () =>
        this.db.boardMember.update({
          where: { memberId_boardId: { boardId, memberId } },
          data: {
            roles,
            permissions: newPermissions,
          },
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
  ): Promise<BoardMember> {
    return this.prisma.handle(
      () =>
        this.db.boardMember.update({
          where: { memberId_boardId: { boardId, memberId } },
          data: {
            permissions,
          },
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
      ...new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role])),
    ];
  }
}
