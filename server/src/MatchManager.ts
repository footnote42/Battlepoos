import { Server, Socket } from 'socket.io';
import { Match } from './Match';
import { v4 as uuidv4 } from 'uuid'; // We might need to install uuid or just use random string

export class MatchManager {
    private matches: Map<string, Match> = new Map();
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    createMatch(): string {
        const matchId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const match = new Match(matchId, this.io);
        this.matches.set(matchId, match);
        return matchId;
    }

    getMatch(matchId: string): Match | undefined {
        return this.matches.get(matchId);
    }

    joinMatch(socket: Socket, matchId: string, playerId?: string) {
        const match = this.matches.get(matchId);
        if (!match) {
            socket.emit('error', { message: 'Match not found' });
            return;
        }
        match.addPlayer(socket, playerId);
    }
}
