import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('QuizGateway');
  private quizRooms = new Map<string, Set<string>>(); // quizId -> Set of socketIds

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove client from all rooms
    this.quizRooms.forEach((clients, quizId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.quizRooms.delete(quizId);
        }
      }
    });
  }

  @SubscribeMessage('joinQuizRoom')
  handleJoinQuizRoom(
    @MessageBody() data: { quizId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { quizId } = data;
    client.join(`quiz-${quizId}`);
    
    if (!this.quizRooms.has(quizId)) {
      this.quizRooms.set(quizId, new Set());
    }
    this.quizRooms.get(quizId)?.add(client.id);

    this.logger.log(`Client ${client.id} joined quiz room: ${quizId}`);
    return { success: true, message: 'Joined quiz room' };
  }

  @SubscribeMessage('leaveQuizRoom')
  handleLeaveQuizRoom(
    @MessageBody() data: { quizId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { quizId } = data;
    client.leave(`quiz-${quizId}`);
    
    const roomClients = this.quizRooms.get(quizId);
    if (roomClients) {
      roomClients.delete(client.id);
      if (roomClients.size === 0) {
        this.quizRooms.delete(quizId);
      }
    }

    this.logger.log(`Client ${client.id} left quiz room: ${quizId}`);
    return { success: true, message: 'Left quiz room' };
  }

  // Emit events to specific quiz rooms
  emitLobbyUpdate(quizId: string, data: any) {
    this.server.to(`quiz-${quizId}`).emit('lobbyUpdate', data);
    this.logger.log(`Lobby update emitted to quiz ${quizId}`);
  }

  emitQuizStarted(quizId: string, data: any) {
    this.server.to(`quiz-${quizId}`).emit('quizStarted', data);
    this.logger.log(`Quiz started event emitted to quiz ${quizId}`);
  }

  emitQuizEnded(quizId: string, data: any) {
    this.server.to(`quiz-${quizId}`).emit('quizEnded', data);
    this.logger.log(`Quiz ended event emitted to quiz ${quizId}`);
  }

  emitParticipantJoined(quizId: string, participant: any) {
    this.server.to(`quiz-${quizId}`).emit('participantJoined', participant);
    this.logger.log(`Participant joined event emitted to quiz ${quizId}`);
  }

  emitParticipantLeft(quizId: string, participantId: string) {
    this.server.to(`quiz-${quizId}`).emit('participantLeft', { participantId });
    this.logger.log(`Participant left event emitted to quiz ${quizId}`);
  }

  emitParticipantRemoved(quizId: string, lobbyId: string) {
    // Notify all clients in the room about the removal
    this.server.to(`quiz-${quizId}`).emit('participantRemoved', { lobbyId });
    this.logger.log(`Participant removed event emitted to quiz ${quizId}, lobbyId: ${lobbyId}`);
  }

  emitLeaderboardUpdate(quizId: string, leaderboard: any) {
    this.server.to(`quiz-${quizId}`).emit('leaderboardUpdate', leaderboard);
    this.logger.log(`Leaderboard update emitted to quiz ${quizId}`);
  }

  emitQuizStatusChange(quizId: string, status: string) {
    this.server.to(`quiz-${quizId}`).emit('quizStatusChange', { status });
    this.logger.log(`Quiz status change emitted to quiz ${quizId}: ${status}`);
  }
}
