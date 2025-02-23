import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BoardPermission } from '@prisma/client';

import { PERMISSIONS_KEY } from '../decorators';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      BoardPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || !requiredPermissions.length)
      return true;

    const request = context.switchToHttp().getRequest<Req>();
    const params = request.params;
    const body = request.body as { boardId: string };

    const userId = request.user?.id;

    const boardId = params?.boardId || body?.boardId || '';

    if (!userId) throw new UnauthorizedException();

    if (!boardId) throw new BadRequestException('boardId is missing');

    const boardMember = await this.db.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
      select: { permissions: true },
    });

    if (!boardMember) {
      const boardExists = await this.db.board.findUnique({
        where: { id: boardId },
        select: { id: true },
      });

      if (!boardExists)
        throw new NotFoundException('Board not found');

      throw new ForbiddenException('Access Denied');
    }

    // Check if the user has the required permissions to access the board.
    const hasPermission = requiredPermissions.every((perm) =>
      boardMember?.permissions?.includes(perm),
    );

    if (!hasPermission)
      throw new ForbiddenException('Insufficient Permissions');

    return true;
  }
}
