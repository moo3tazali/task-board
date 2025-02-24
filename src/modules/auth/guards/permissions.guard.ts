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

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest<Req>();
    const params = request.params;
    const body = request.body as { boardId?: string };
    const query = request.query;

    const userId = request.user?.id;

    const boardId =
      params?.boardId ||
      body?.boardId ||
      (query?.boardId as string) ||
      '';

    if (!userId)
      throw new UnauthorizedException(
        'Invalid token or user not found. Please log in again.',
      );

    if (!boardId) throw new BadRequestException('boardId is missing');

    const board = await this.getBoard(boardId, userId);

    if (!board) throw new NotFoundException('Board not found');

    if (board.ownerId === userId) return true;

    const boardMember = board.members[0];

    if (!boardMember)
      throw new ForbiddenException('Unauthorized access');

    if (!requiredPermissions.length) return true;

    // Check if the user has the required board permissions.
    const hasPermission = requiredPermissions.every((perm) =>
      boardMember?.permissions?.includes(perm),
    );

    if (!hasPermission)
      throw new ForbiddenException(
        'Unauthorized action, you do not have the required permissions',
      );

    return true;
  }

  private async getBoard(boardId: string, userId: string) {
    return await this.db.board.findUnique({
      where: { id: boardId },
      select: {
        ownerId: true,
        members: {
          where: { memberId: userId },
          select: {
            memberId: true,
            roles: true,
            permissions: true,
          },
        },
      },
    });
  }
}
