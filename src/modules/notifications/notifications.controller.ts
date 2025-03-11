import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Auth } from '../auth/decorators';
import { PaginationDto } from 'src/common/dtos';
import { NotificationsService } from './notifications.service';
import { NotificationList } from './interfaces';
import { NotificationIdDto } from './dtos';
import { NotificationsGateway } from './notifications.gateway';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationGateway: NotificationsGateway,
  ) {}

  /**
   * Get user notifications list
   */
  @ApiBearerAuth()
  @Get('list')
  public async getList(
    @Auth('id') userId: string,
    @Query() pagination: PaginationDto,
  ): Promise<NotificationList> {
    const [items, count] = await this.notificationsService.getList(
      userId,
      pagination,
    );

    return {
      items,
      meta: {
        count,
        limit: pagination.limit,
        skip: pagination.skip,
      },
    };
  }

  /**
   * Read the notification
   */
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('read')
  public async read(
    @Body() { notificationId }: NotificationIdDto,
  ): Promise<void> {
    await this.notificationsService.read(notificationId);
  }

  /**
   * Send a test notification
   */
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('test')
  public test(@Auth('id') userId: string): void {
    const createdAt = new Date();

    this.notificationGateway.send(userId, {
      id: '123',
      userId,
      type: 'GENERAL',
      message: 'This is a test notification',
      isRead: false,
      data: null,
      referenceId: null,
      createdAt,
    });
  }
}
