import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Auth, Permissions } from '../auth/decorators';
import { BoardMembersService } from './board-members.service';
import {
  AddMembersDto,
  DeleteMembersDto,
  MemberIdDto,
  UpdateMemberPermissionsDto,
  UpdateMemberRolesDto,
} from './dtos';
import { PaginationDto } from 'src/common/dtos';
import { BoardIdDto } from '../boards/dtos';
import { MemberList, MemberWithPermissions } from './interfaces';
import {
  BoardMember,
  BoardPermission,
  BoardRole,
  NotificationType,
} from '@prisma/client';
import { ROLE_PERMISSIONS } from '../auth/constants';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('members')
export class BoardMembersController {
  constructor(
    private readonly membersService: BoardMembersService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Add members to my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.BOARD_MEMBERS_CREATE)
  @Post()
  public async addMembers(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() { membersIds }: AddMembersDto,
  ): Promise<void> {
    // ADD MEMBERS TO DB
    await this.membersService.addMembers(boardId, membersIds);

    // notifi all added members
    this.notifications.createAndSend(
      membersIds.map((memberId) => ({
        userId: memberId,
        referenceId: boardId,
        type: NotificationType.BOARD_INVITE,
        data: { membersIds },
      })),
    );

    // notifi the board owner
    this.notifications.notifiBoardOwner({
      boardId,
      userId,
      type: NotificationType.MEMBER_ADDED,
      data: { membersIds },
    });
  }

  /**
   * Get a list of members of my own board or the board i'm one of its members
   */
  @ApiBearerAuth()
  @Permissions()
  @Get('list')
  public async membersList(
    @Param() boardIdDto: BoardIdDto,
    @Query() pagination: PaginationDto,
  ): Promise<MemberList> {
    const [items, count] = await this.membersService.membersList(
      boardIdDto.boardId,
      pagination,
    );

    return {
      items,
      meta: {
        count,
        limit: pagination.limit,
        skip: pagination.skip,
      },
    };
  }

  /**
   * Update a member roles for my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.BOARD_MEMBERS_ROLE_UPDATE)
  @Patch('roles')
  public async updateMemberRoles(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() { memberId, roles }: UpdateMemberRolesDto,
  ): Promise<BoardMember> {
    // check if self role update
    if (userId === memberId) {
      throw new ForbiddenException(
        'Unauthorized action, You cannot update your own roles.',
      );
    }

    // update roles
    const updatedMember = await this.membersService.updateMemberRoles(
      boardId,
      memberId,
      roles,
    );

    // create notifications
    this.notifications.createAndSend([
      {
        userId: memberId,
        referenceId: boardId,
        type: NotificationType.BOARD_ROLE_UPDATED,
        data: { memberId },
      },
    ]);

    return updatedMember;
  }

  /**
   * Update a member permissions for my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.BOARD_MEMBERS_PERMISSION_UPDATE)
  @Patch('permissions')
  public async updateMemberPermissions(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Body() { memberId, permissions }: UpdateMemberPermissionsDto,
  ): Promise<BoardMember> {
    const [userRoles, memberRoles] = await Promise.all([
      this.membersService.getMemberRole(boardId, userId),
      this.membersService.getMemberRole(boardId, memberId),
    ]);

    this.verifyNotSelfPermissionsUpdate(memberId, userId);
    this.verifyNotHigherRoleUpdate(userRoles, memberRoles);
    this.verifyValidPermissionsToRoles(memberRoles, permissions);

    const updatedMember =
      await this.membersService.updateMemberPermissions(
        boardId,
        memberId,
        permissions,
      );

    // notifi the member
    this.notifications.createAndSend([
      {
        userId: memberId,
        referenceId: boardId,
        type: NotificationType.BOARD_PERMISIONS_UPDATED,
        data: { memberId },
      },
    ]);

    // notifi board owner
    this.notifications.notifiBoardOwner({
      boardId,
      userId,
      type: NotificationType.MEMBER_PERMISSION_UPDATED,
      data: { memberId },
    });

    return updatedMember;
  }

  /**
   * Get one member of my own board or the board i'm one of its members
   */
  @ApiBearerAuth()
  @Permissions()
  @Get(':memberId')
  public async getMember(
    @Param() { boardId }: BoardIdDto,
    @Param() { memberId }: MemberIdDto,
  ): Promise<MemberWithPermissions> {
    return this.membersService.getOne(boardId, memberId);
  }

  /**
   * delete members from my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.BOARD_MEMBERS_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  public async deleteMembers(
    @Auth('id') userId: string,
    @Param() { boardId }: BoardIdDto,
    @Query() { memberIds }: DeleteMembersDto,
  ): Promise<void> {
    await this.membersService.deleteMembers(boardId, memberIds);

    // notifi all removed members
    this.notifications.createAndSend(
      memberIds.map((memberId) => ({
        userId: memberId,
        referenceId: boardId,
        type: NotificationType.BOARD_MEMBER_REMOVED,
        data: { memberIds },
      })),
    );

    // notifi board owner
    this.notifications.notifiBoardOwner({
      boardId,
      userId,
      type: NotificationType.MEMBER_REMOVED,
      data: { memberIds },
    });
  }

  /**
   * Private methods
   */

  private verifyNotSelfPermissionsUpdate(
    memberId: string,
    userId: string,
  ): void {
    if (memberId !== userId) return;

    throw new ForbiddenException(
      "Unauthorized action, You can't modify your own permissions. Only the board owner can do that.",
    );
  }

  private verifyNotHigherRoleUpdate(
    userRoles: BoardRole[],
    memberRoles: BoardRole[],
  ): void {
    const roleHierarchy: Record<BoardRole, number> = {
      OWNER: 3,
      MANAGER: 2,
      MEMBER: 1,
      VIEWER: 0,
    };

    const userMaxRole = Math.max(
      ...userRoles.map((role) => roleHierarchy[role]),
    );
    const memberMaxRole = Math.max(
      ...memberRoles.map((role) => roleHierarchy[role]),
    );

    if (memberMaxRole >= userMaxRole) {
      throw new ForbiddenException(
        "Unauthorized action, You can't modify the permissions of a member with the same or a higher role than yours.",
      );
    }
  }

  private verifyValidPermissionsToRoles(
    memberRoles: BoardRole[],
    permissions: BoardPermission[],
  ): void {
    const allowedPermissions = [
      ...new Set(
        memberRoles.flatMap((role) => ROLE_PERMISSIONS[role]),
      ),
    ];

    const invalidPermissions = permissions.filter(
      (permission) => !allowedPermissions.includes(permission),
    );

    if (invalidPermissions.length > 0) {
      throw new ForbiddenException(
        `Unauthorized action, You cannot assign the following permissions as they are not part of target member roles: ${JSON.stringify(invalidPermissions)}`,
      );
    }
  }
}
