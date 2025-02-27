import { Board as PrismaBoard } from '@prisma/client';
import { Pagination } from 'src/common/interfaces';

export class Board implements Partial<PrismaBoard> {
  id: string;
  title: string;
  description: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export class BoardList implements Pagination<Board> {
  items: Board[];
  meta: { count: number; skip: number; limit: number };
}
