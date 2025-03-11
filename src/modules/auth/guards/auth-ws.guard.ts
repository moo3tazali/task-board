import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

import { AuthConfig, ConfigType } from 'src/config';
import { UserService } from 'src/modules/user/user.service';
import { Payload } from '../interfaces';

@Injectable()
export class AuthWsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigType>,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);

    if (!token) {
      client.emit('exception', {
        message: 'No token provided for WebSocket connection.',
      });
      client.disconnect();
      return false;
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
        client.emit('exception', {
          message: 'Invalid token',
        });
        client.disconnect();
        return false;
      }

      client.user = user;
    } catch {
      client.emit('exception', {
        message: 'Invalid token',
      });
      client.disconnect();
      return false;
    }
    return true;
  }

  private extractToken(client: Socket): string | undefined {
    return client.handshake.auth?.token as string | undefined;
  }
}
