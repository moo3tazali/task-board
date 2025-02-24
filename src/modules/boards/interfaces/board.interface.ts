import { Board as PrismaBoard } from '@prisma/client';
import { Pagination } from 'src/common/interfaces';
import { Member } from 'src/modules/board-members/interfaces';

export class Board implements PrismaBoard {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BoardList implements Pagination<Board> {
  items: Board[];
  meta: { count: number; skip: number; limit: number };
}

type BoardMembersType = Board & {
  members: Member[];
};

export class BoardMembers implements BoardMembersType {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members: Member[];
}
