import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { AuthService } from 'auth/auth.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection {
  constructor(private authService: AuthService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    try {
      const isValidated = await this.authService.validateToken(
        socket.handshake.headers.authorization,
      );

      if (!isValidated) {
        throw new WsException('Invalid Token');
      }

      return socket.emit('auth', 'Login Successfully');
    } catch (error) {
      socket.emit('auth', error.message);
      socket.disconnect();
    }
  }

  @SubscribeMessage('events')
  onEvent(@MessageBody() body: any) {
    console.log(body);
  }

  emitEvent(event: string, data: any) {
    this.server.emit(event, data);
  }
}
