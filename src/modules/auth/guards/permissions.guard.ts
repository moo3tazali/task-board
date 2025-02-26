import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ValidationError,
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

    // get board from the db or fail.
    const board = await this.getBoardOrFail(boardId, userId);

    // check if the user is the board owner, and allow all actions.
    if (board.ownerId === userId) return true;

    // get the user membership from the board.
    const boardMember = board.members[0];
    if (!boardMember)
      throw new ForbiddenException('Unauthorized access');

    // check if there are any required permissions to verify.
    if (!requiredPermissions.length) return true;

    // verify if the user has the required board permissions.
    this.verifyRequiredPermissions(
      requiredPermissions,
      boardMember.permissions,
    );

    // check if the user has the required permissions to manage members and try to preform actions on his membership.
    this.checkSelfMemberActions(
      requiredPermissions,
      boardMember.memberId,
      userId,
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
    const boardId =
      request.params?.boardId ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.body?.boardId ??
      (request.query?.boardId as string);

    if (!boardId) throw new BadRequestException('boardId is missing');

    const dto = new BoardIdDto();
    dto.boardId = boardId;

    const errors = validateSync(dto);

    if (errors.length > 0) {
      this.throwValidationException(errors);
    }

    return boardId;
  }

  // try to get the board from the database
  private async getBoardOrFail(boardId: string, userId: string) {
    const board = await this.db.board.findUnique({
      where: { id: boardId },
      select: {
        ownerId: true,
        members: {
          where: { memberId: userId },
          take: 1,
          select: {
            memberId: true,
            permissions: true,
          },
        },
      },
    });

    if (!board) throw new NotFoundException('Board not found');

    return board;
  }

  // try to verify if the user has the required board permissions.
  private verifyRequiredPermissions(
    requiredPermissions: BoardPermission[],
    boardMemberPermissions: BoardPermission[],
  ): void {
    const hasPermission = requiredPermissions.every((perm) =>
      boardMemberPermissions?.includes(perm),
    );

    if (!hasPermission)
      throw new ForbiddenException(
        'Unauthorized action, you do not have the required permissions',
      );
  }

  // try to verify if the user has the required permissions to manage members and try to preform actions on his membership.
  private checkSelfMemberActions(
    requiredPermissions: BoardPermission[],
    memberId: string,
    userId: string,
  ): void {
    const isMangeMembersPermissions = requiredPermissions.some(
      (perm) =>
        [
          'BOARD_MEMBERS_ROLE_UPDATE',
          'BOARD_MEMBERS_UPDATE',
          'BOARD_MEMBERS_DELETE',
        ].includes(perm),
    );

    if (memberId === userId && isMangeMembersPermissions) {
      throw new ForbiddenException(
        "You can't perform this action on yourself, ask the board owner to do so",
      );
    }
  }

  // reformat the validation errors into a NestJS-friendly format and throw it.
  private throwValidationException(errors: ValidationError[]) {
    throw new BadRequestException({
      statusCode: 400,
      message: errors.flatMap((error) =>
        Object.values(error.constraints || {}),
      ),
      error: 'Bad Request',
    });
  }
}
