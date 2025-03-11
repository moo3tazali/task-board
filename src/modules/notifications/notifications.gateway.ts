import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notification } from '@prisma/client';
import { UseGuards } from '@nestjs/common';

import { AuthWsGuard } from '../auth/guards';

@WebSocketGateway({
  namespace: '/hub/notifications',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  public handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string;

    if (!token) {
      client.emit('exception', {
        message: 'No token provided for WebSocket connection.',
      });
      return client.disconnect();
    }

    // console.log(`Client connected: ${client.id}`);
  }

  public handleDisconnect() {
    // console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(AuthWsGuard)
  @SubscribeMessage('subscribe')
  public async subscribe(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.user.id;
    await client.join(`user_${userId}`);
    // console.log(`user_${userId} JOINED!`);
  }

  public send(notifications: Notification[]): void {
    notifications.forEach((n) =>
      this.server.to(`user_${n.userId}`).emit('new', n),
    );
  }
}
