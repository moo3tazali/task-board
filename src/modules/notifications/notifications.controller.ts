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

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
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
}
