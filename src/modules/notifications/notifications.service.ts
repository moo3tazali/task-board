import { Injectable } from '@nestjs/common';
import { Notification, NotificationType } from '@prisma/client';

import { PaginationDto } from 'src/common/dtos';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionsService } from '../prisma/prisma-exceptions.service';
import { NotificationMessages } from './constants';
import { NotificationsGateway } from './notifications.gateway';
import { BoardMembersService } from '../board-members/board-members.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: PrismaService,
    private readonly prisma: PrismaExceptionsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly membersService: BoardMembersService,
  ) {}

  public async create(
    dto: {
      userId: string;
      type: NotificationType;
      message?: string;
      referenceId?: string;
      data?: {
        [key: string]: string | number | boolean | [] | object;
      };
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
      data?: {
        [key: string]: string | number | boolean | [] | object;
      };
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

  public notifiBoardMembers(obj: {
    boardId: string;
    userId: string;
    type: NotificationType;
    message?: string;
    data?: {
      [key: string]: string | number | boolean | [] | object;
    };
  }) {
    this.membersService
      .getMembersIds(obj.boardId)
      .then((memberIds) => {
        memberIds.forEach(({ memberId }) => {
          if (memberId === obj.userId) return;
          this.createAndSend([
            {
              userId: memberId,
              referenceId: obj.boardId,
              type: obj.type,
              data: obj.data,
              message: obj.message,
            },
          ]);
        });
      })
      .catch((error) => {
        console.error(
          'Failed to get members ids at notifiactions service',
          error,
        );
      });
  }

  public notifiBoardOwnerAndMangers(obj: {
    boardId: string;
    userId: string;
    type: NotificationType;
    data?: {
      [key: string]: string | number | boolean | [] | object;
    };
    message?: string;
  }) {
    this.membersService
      .getBoardOwnerAndManagersIds(obj.boardId)
      .then((memberIds) => {
        memberIds.forEach(({ memberId }) => {
          if (memberId === obj.userId) return;
          this.createAndSend([
            {
              userId: memberId,
              referenceId: obj.boardId,
              type: obj.type,
              data: obj.data,
              message: obj.message,
            },
          ]);
        });
      })
      .catch((error) => {
        console.error(
          'Failed to get owner and managers ids at notifiactions service',
          error,
        );
      });
  }
}
