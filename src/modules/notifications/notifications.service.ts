import { Injectable } from '@nestjs/common';
import { Notification, NotificationType } from '@prisma/client';

import { PaginationDto } from 'src/common/dtos';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: PrismaService,
    private readonly prisma: PrismaExceptionsService,
  ) {}

  public async create(
    dto: {
      userId: string;
      type: NotificationType;
      message: string;
      referenceId?: string;
      data?: { [key: string]: string | number | boolean };
    }[],
  ): Promise<Notification[]> {
    return this.prisma.handle(() =>
      Promise.all(
        dto.map((data) => this.db.notification.create({ data })),
      ),
    );
  }

  public async getList(
    userId: string,
    pagination: PaginationDto,
  ): Promise<[Notification[], number]> {
    return this.prisma.handle(() =>
      Promise.all([
        this.db.notification.findMany({
          where: { userId },
          orderBy: { createdAt: pagination.order },
          skip: pagination.skip,
          take: pagination.limit,
        }),
        this.db.notification.count({ where: { userId } }),
      ]),
    );
  }

  public async read(notificationId: string): Promise<Notification> {
    return this.prisma.handle(() =>
      this.db.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
        },
      }),
    );
  }
}
