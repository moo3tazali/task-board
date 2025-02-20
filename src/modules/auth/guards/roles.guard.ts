import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { ROLES_KEY } from '../decorators';
import { Payload } from '../interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<Req>();

    const user = request?.user as Payload;

    return requiredRoles.every((role) => user.roles.includes(role));
  }
}
