import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    private quizRooms;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinQuizRoom(data: {
        quizId: string;
    }, client: Socket): {
        success: boolean;
        message: string;
    };
    handleLeaveQuizRoom(data: {
        quizId: string;
    }, client: Socket): {
        success: boolean;
        message: string;
    };
    emitLobbyUpdate(quizId: string, data: any): void;
    emitQuizStarted(quizId: string, data: any): void;
    emitQuizEnded(quizId: string, data: any): void;
    emitParticipantJoined(quizId: string, participant: any): void;
    emitParticipantLeft(quizId: string, participantId: string): void;
    emitParticipantRemoved(quizId: string, lobbyId: string): void;
    emitLeaderboardUpdate(quizId: string, leaderboard: any): void;
    emitQuizStatusChange(quizId: string, status: string): void;
}
