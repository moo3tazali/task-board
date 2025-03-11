import { Injectable } from '@nestjs/common';
import { Notification, NotificationType } from '@prisma/client';

import { PaginationDto } from 'src/common/dtos';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';
import { NotificationMessages } from './constants';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: PrismaService,
    private readonly prisma: PrismaExceptionsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  public async create(
    dto: {
      userId: string;
      type: NotificationType;
      message?: string;
      referenceId?: string;
      data?: { [key: string]: string | number | boolean };
    }[],
  ): Promise<Notification[]> {
    return this.prisma.handle(() =>
      Promise.all(
        dto.map((data) =>
          this.db.notification.create({
            data: {
              ...data,
              message:
                data?.message || NotificationMessages[data.type],
            },
          }),
        ),
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

  public createAndSend(
    dto: {
      userId: string;
      type: NotificationType;
      message?: string;
      referenceId?: string;
      data?: { [key: string]: string | number | boolean };
    }[],
  ) {
    void this.create(dto)
      .then((notifications) =>
        this.notificationsGateway.send(notifications),
      )
      .catch((error) =>
        console.error('Failed to send notification:', error),
      );
  }
}
