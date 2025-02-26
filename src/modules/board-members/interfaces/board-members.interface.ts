import { ApiProperty } from '@nestjs/swagger';
import {
  User as PrismaUser,
  BoardRole,
  BoardPermission,
} from '@prisma/client';
import { Pagination } from 'src/common/interfaces';

type UserType = Pick<
  PrismaUser,
  'id' | 'username' | 'email' | 'avatarPath'
>;

class User implements UserType {
  id: string;
  username: string;
  email: string;
  avatarPath: string | null;
}

export class Member {
  boardId: string;
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
