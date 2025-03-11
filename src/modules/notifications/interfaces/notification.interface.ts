import { ApiProperty } from '@nestjs/swagger';
import {
  Notification as PrismaNotification,
  NotificationType,
} from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { Pagination } from 'src/common/interfaces';

export class Notification implements PrismaNotification {
  id: string;
  userId: string;
  referenceId: string | null;
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.BOARD_INVITE,
  })
  type: NotificationType;
  message: string;
  data: JsonValue;
  /**
   * @example false
   */
  isRead: boolean;
  createdAt: Date;
}

export class NotificationList implements Pagination<Notification> {
  items: Notification[];
  meta: { count: number; skip: number; limit: number };
}
