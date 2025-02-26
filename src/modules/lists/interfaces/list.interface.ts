import { List as PrismaList } from '@prisma/client';
import { Pagination } from 'src/common/interfaces';

export class List implements PrismaList {
  id: string;
  title: string;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ListList implements Pagination<List> {
  items: List[];
  meta: { count: number; skip: number; limit: number };
}
