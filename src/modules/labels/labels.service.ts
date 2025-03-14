import { Injectable } from '@nestjs/common';
import { Label } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';

@Injectable()
export class LabelsService {
  constructor(
    private readonly db: PrismaService,
    private readonly prisma: PrismaExceptionsService,
  ) {}

  public async labelList(search?: string): Promise<Label[]> {
    return this.prisma.handle(() =>
      this.db.label.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    );
  }

  public async create(dto: { name: string }): Promise<Label> {
    return this.prisma.handle(() =>
      this.db.label.create({
        data: dto,
      }),
    );
  }

  public async update(
    labelId: string,
    dto: { name: string },
  ): Promise<Label> {
    return this.prisma.handle(() =>
      this.db.label.update({
        where: { id: labelId },
        data: dto,
      }),
    );
  }

  public async delete(labelId: string): Promise<void> {
    await this.prisma.handle(() =>
      this.db.label.delete({
        where: { id: labelId },
      }),
    );
  }
}
