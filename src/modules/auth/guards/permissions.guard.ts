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
import { validateSync } from 'class-validator';

import { PERMISSIONS_KEY } from '../decorators';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { BoardIdDto } from 'src/modules/boards/dtos';

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

    // get use id from the request or fail.
    const userId = this.getRequestUserIdOrFail(request);

    // get board id from the request or fail.
    const boardId = this.getRequestBoardIdOrFail(request);

    // get board member from the db or fail.
    const boardMember = await this.getBoardMemberOrFail(
      boardId,
      userId,
    );

    // check if there are any required permissions to verify.
    if (!requiredPermissions.length) return true;

    // verify if the user has the required board permissions.
    this.verifyRequiredPermissions(
      requiredPermissions,
      boardMember.permissions,
    );

    return true;
  }

  // try to get the userId from the request or fail.
  private getRequestUserIdOrFail(request: Req): string {
    const userId = request.user?.id;

    if (!userId)
      throw new UnauthorizedException(
        'Invalid token or user not found. Please log in again.',
      );

    return userId;
  }

  // try to get the boardId from the request or fail.
  private getRequestBoardIdOrFail(request: Req): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { params, body, query } = request;

    const boardId =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      params?.boardId ?? body?.boardId ?? (query?.boardId as string);

    if (!boardId) throw new BadRequestException('boardId is missing');

    this.validateBoardId(boardId);

    return boardId;
  }

  // try to get the board from the database
  private async getBoardMemberOrFail(
    boardId: string,
    userId: string,
  ) {
    const boardMember = await this.db.boardMember.findUnique({
      where: { memberId_boardId: { boardId, memberId: userId } },
      select: {
        boardId: true,
        memberId: true,
        roles: true,
        permissions: true,
      },
    });

    if (!boardMember)
      throw new NotFoundException(
        `No board member found for boardId: ${boardId}`,
      );

    return boardMember;
  }

  // try to verify if the user has the required board permissions.
  private verifyRequiredPermissions(
    requiredPermissions: BoardPermission[],
    boardMemberPermissions: BoardPermission[],
  ): void {
    const missingPermissions = requiredPermissions.filter(
      (perm) => !boardMemberPermissions.includes(perm),
    );

    if (missingPermissions.length > 0) {
      throw new ForbiddenException(
        `Unauthorized action. You lack the following permissions: ${JSON.stringify(missingPermissions)}`,
      );
    }
  }

  // validate boardId.
  private validateBoardId(boardId: string) {
    const dto = new BoardIdDto();
    dto.boardId = boardId;

    const errors = validateSync(dto);

    if (errors.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: errors.flatMap((error) =>
          Object.values(error.constraints || {}),
        ),
        error: 'Bad Request',
      });
    }
  }
}
