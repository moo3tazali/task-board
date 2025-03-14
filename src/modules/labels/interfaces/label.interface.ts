import { Label as PrismaLabel } from '@prisma/client';

export class Label implements PrismaLabel {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
