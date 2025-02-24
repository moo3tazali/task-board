import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AuthConfig, ConfigType } from 'src/config';
import { IS_PUBLIC_KEY } from '../decorators';
import { Payload } from '../interfaces';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigType>,
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Req>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'No token provided. Please provide a token in the Authorization header using the Bearer scheme. e.g. "Bearer <token>"',
      );
    }

    try {
      const payload: Payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get<AuthConfig>('auth')?.secret,
        },
      );

      const user = await this.userService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException(
          'Invalid token or user not found. Please log in again.',
        );
      }

      request.user = user;
    } catch {
      throw new UnauthorizedException(
        'Invalid token or user not found. Please log in again.',
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Req): string | undefined {
    const [type, token] =
      request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
