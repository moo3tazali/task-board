import { Board as PrismaBoard } from '@prisma/client';
import { Pagination } from 'src/common/interfaces';

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
