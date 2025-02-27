import { ApiProperty } from '@nestjs/swagger';
import {
  User as PrismaUser,
  BoardRole,
  BoardPermission,
  BoardMember,
} from '@prisma/client';
import { Pagination } from 'src/common/interfaces';

class User implements Partial<PrismaUser> {
  id: string;
  username: string;
  email: string;
  avatarPath: string | null;
}

export class Member implements Partial<BoardMember> {
  boardId: string;
  memberId: string;
  user: User;
  @ApiProperty({
    enum: BoardRole,
    isArray: true,
    example: [BoardRole.MEMBER, BoardRole.MANAGER],
  })
  roles: BoardRole[];
  createdAt: Date;
  updatedAt: Date;
}

export class MemberWithPermissions extends Member {
  @ApiProperty({
    enum: BoardPermission,
    isArray: true,
    example: [
      BoardPermission.TASK_CREATE,
      BoardPermission.LIST_CREATE,
    ],
  })
  permissions: BoardPermission[];
}

export class MemberList implements Pagination<Member> {
  items: Member[];
  meta: { count: number; skip: number; limit: number };
}
