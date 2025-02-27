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
} from '@prisma/client';
import { ROLE_PERMISSIONS } from '../auth/constants';

@Controller('boardMembers')
export class BoardMembersController {
  constructor(private readonly membersService: BoardMembersService) {}

  /**
   * Add members to my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.BOARD_MEMBERS_CREATE)
  @Post()
  public async addMembers(
    @Body() addMembersDto: AddMembersDto,
  ): Promise<void> {
    await this.membersService.addMembers(
      addMembersDto.boardId,
      addMembersDto.membersIds,
    );
  }

  /**
   * Get one member of my own board or the board i'm one of its members
   */
  @ApiBearerAuth()
  @Permissions()
  @Get()
  public async getMember(
    @Query() { boardId }: BoardIdDto,
    @Query() { memberId }: MemberIdDto,
  ): Promise<MemberWithPermissions> {
    return this.membersService.getOne(boardId, memberId);
  }

  /**
   * Get a list of members of my own board or the board i'm one of its members
   */
  @ApiBearerAuth()
  @Permissions()
  @Get('list')
  public async membersList(
    @Query() boardIdDto: BoardIdDto,
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
    @Body() updateMemberRoles: UpdateMemberRolesDto,
  ): Promise<BoardMember> {
    if (userId === updateMemberRoles.memberId) {
      throw new ForbiddenException(
        'Unauthorized action, You cannot update your own roles.',
      );
    }

    return this.membersService.updateMemberRoles(
      updateMemberRoles.boardId,
      updateMemberRoles.memberId,
      updateMemberRoles.roles,
    );
  }

  /**
   * Update a member permissions for my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.BOARD_MEMBERS_PERMISSION_UPDATE)
  @Patch('permissions')
  public async updateMemberPermissions(
    @Auth('id') userId: string,
    @Body() updateMemberPermissions: UpdateMemberPermissionsDto,
  ): Promise<BoardMember> {
    const { boardId, memberId, permissions } =
      updateMemberPermissions;

    const [userRoles, memberRoles] = await Promise.all([
      this.membersService.getMemberRole(boardId, userId),
      this.membersService.getMemberRole(boardId, memberId),
    ]);

    this.verifyNotSelfPermissionsUpdate(memberId, userId);
    this.verifyNotHigherRoleUpdate(userRoles, memberRoles);
    this.verifyValidPermissionsToRoles(memberRoles, permissions);

    return this.membersService.updateMemberPermissions(
      boardId,
      memberId,
      permissions,
    );
  }

  /**
   * delete members from my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions(BoardPermission.BOARD_MEMBERS_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':boardId')
  public async deleteMembers(
    @Param() boardIdParam: BoardIdDto,
    @Query() deleteMembersDto: DeleteMembersDto,
  ): Promise<void> {
    return this.membersService.deleteMembers(
      boardIdParam.boardId,
      deleteMembersDto.memberIds,
    );
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
