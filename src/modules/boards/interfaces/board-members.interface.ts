import { ApiProperty } from '@nestjs/swagger';
import {
  Board,
  User as PrismaUser,
  BoardPermission,
} from '@prisma/client';

type User = Pick<
  PrismaUser,
  'id' | 'username' | 'email' | 'avatarPath'
>;

type BoardMembersType = Board & {
  members: {
    boardId: string;
    user: User;
    permissions: BoardPermission[];
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export class Member {
  boardId: string;
  user: User;
  @ApiProperty({
    enum: BoardPermission,
    isArray: true,
    example: ['VIEW'],
  })
  permissions: BoardPermission[];
  isOwner: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class BoardMembers implements BoardMembersType {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members: Member[];
}
