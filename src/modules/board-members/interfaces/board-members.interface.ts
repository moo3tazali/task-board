import { ApiProperty } from '@nestjs/swagger';
import { User as PrismaUser, BoardRole } from '@prisma/client';
import { Pagination } from 'src/common/interfaces';

type User = Pick<
  PrismaUser,
  'id' | 'username' | 'email' | 'avatarPath'
>;

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

export class MemberList implements Pagination<Member> {
  items: Member[];
  meta: { count: number; skip: number; limit: number };
}
