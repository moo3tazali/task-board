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

import { Permissions } from '../auth/decorators';
import { BoardMembersService } from './board-members.service';
import {
  AddMembersDto,
  DeleteMembersDto,
  UpdateMemberPermissionsDto,
  UpdateMemberRolesDto,
} from './dtos';
import { PaginationDto } from 'src/common/dtos';
import { BoardIdDto } from '../boards/dtos';
import { Member, MemberList } from './interfaces';

@Controller('boardMembers')
export class BoardMembersController {
  constructor(private readonly membersService: BoardMembersService) {}

  /**
   * Add members to my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions('BOARD_MEMBERS_CREATE')
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
  @Permissions('BOARD_MEMBERS_ROLE_UPDATE')
  @Patch('roles')
  public async updateMemberRoles(
    @Body() updateMemberRoles: UpdateMemberRolesDto,
  ): Promise<Member> {
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
  @Permissions('BOARD_MEMBERS_ROLE_UPDATE')
  @Patch('permissions')
  public async updateMemberPermissions(
    @Body() updateMemberPermissions: UpdateMemberPermissionsDto,
  ): Promise<Member> {
    return this.membersService.updateMemberPermissions(
      updateMemberPermissions.boardId,
      updateMemberPermissions.memberId,
      updateMemberPermissions.permissions,
    );
  }

  /**
   * delete members from my own board or a board i have permissions to manage it
   */
  @ApiBearerAuth()
  @Permissions('BOARD_MEMBERS_DELETE')
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

  // private methods
  private checkUpateOwnRolesOrPermissions(
    memberId: string,
    userId: string,
  ) {
    if (memberId !== userId) return;

    throw new ForbiddenException(
      "You can't perform this action on yourself, ask the board owner to do so",
    );
  }
}
