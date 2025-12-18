import { Server, Socket } from 'socket.io';
import {
    GameState,
    PlayerBoard,
    Ship,
    Coordinate,
    isValidPlacement,
    resolveShot,
    isGameOver
} from '../../shared/src'; // Implicitly using shared src

export class Match {
    id: string;
    state: GameState;
    private io: Server;
    private socketMap: Map<string, Socket> = new Map(); // playerId -> socket

    constructor(id: string, io: Server) {
        this.id = id;
        this.io = io;
        this.state = {
            matchId: id,
            phase: 'lobby',
            players: {},
            turn: '',
            winner: null
        };
    }

    addPlayer(socket: Socket, requestedId?: string) {
        // If reconnecting
        if (requestedId && this.state.players[requestedId]) {
            this.reconnectPlayer(socket, requestedId);
            return;
        }

        // New player
        if (Object.keys(this.state.players).length >= 2) {
            socket.emit('error', { message: 'Match full' });
            return;
        }

        const playerId = requestedId || Math.random().toString(36).substring(7);
        this.state.players[playerId] = {
            ships: [],
            shots: new Map()
        };
        this.socketMap.set(playerId, socket);

        // Setup listeners
        this.setupListeners(socket, playerId);

        // Update phase
        if (Object.keys(this.state.players).length === 2) {
            this.state.phase = 'placement';
            this.broadcastState();
        } else {
            // Send initial state to this player
            this.sendStateTo(playerId);
        }
    }

    reconnectPlayer(socket: Socket, playerId: string) {
        this.socketMap.set(playerId, socket);
        this.setupListeners(socket, playerId);
        this.sendStateTo(playerId);
    }

    setupListeners(socket: Socket, playerId: string) {
        socket.on('place_ships', (ships: Ship[]) => {
            this.handlePlacement(playerId, ships);
        });

        socket.on('fire_shot', (coord: Coordinate) => {
            this.handleShot(playerId, coord);
        });
    }

    handlePlacement(playerId: string, ships: Ship[]) {
        if (this.state.phase !== 'placement') return;

        // Validate all ships
        // For simplicity, assuming full fleet sent at once
        // TODO: Validate fleet composition (1 carrier, etc.)

        // Check validity on board
        for (const ship of ships) {
            // Checking against other ships in the same payload passed?
            // logic.isValidPlacement checks against *existing* ships.
            // We should validate the whole set against itself.
            // Quick hack: validate incrementally
            const currentBatch: Ship[] = [];
            for (const s of ships) {
                if (!isValidPlacement(s, currentBatch)) {
                    this.emitError(playerId, 'Invalid placement');
                    return;
                }
                currentBatch.push(s);
            }
        }

        this.state.players[playerId].ships = ships;

        // Check if both ready
        const allReady = Object.values(this.state.players).every(p => p.ships.length > 0);
        if (allReady) {
            this.state.phase = 'active';
            this.state.turn = Object.keys(this.state.players)[0]; // Randomize?
            this.broadcastState();
        } else {
            // Just Update state for player (or broadcast that p1 is ready)
            this.broadcastState();
        }
    }

    handleShot(playerId: string, coord: Coordinate) {
        if (this.state.phase !== 'active') return;
        if (this.state.turn !== playerId) {
            this.emitError(playerId, "Not your turn");
            return;
        }

        const opponentId = Object.keys(this.state.players).find(id => id !== playerId);
        if (!opponentId) return; // Should not happen

        const opponentBoard = this.state.players[opponentId];

        // Check if already shot
        const key = `${coord.x},${coord.y}`;
        if (opponentBoard.shots.has(key)) return; // Or error

        // Resolve shot
        // Note: shots are stored on the *attacker's* board or *defender's* board?
        // In Battleship, you mark your shots on your tracking grid.
        // But the *state* of the cell (hit/miss) belongs to the coordinate on the opponent's board.
        // My PlayerBoard definition has `shots: Map<string, CellState>`.
        // It's ambiguous. Let's assume `shots` tracks INCOMING shots for that player (where they got hit).
        // So we update `opponentBoard.shots`.

        // Actually, logic.resolveShot takes "board" and checks ships.
        const result = resolveShot(opponentBoard, coord);

        // Update state
        opponentBoard.shots.set(key, result.result);
        // Update ship hits if needed, but resolveShot calculated based on ships + shots.
        // If resolveShot handles sinking, we should update the ship object in the array?
        // logic.resolveShot returned "shipSunk".
        if (result.shipSunk) {
            // Find and update the ship in opponent fleet to sunk
            const s = opponentBoard.ships.find(ship => ship.id === result.shipSunk!.id);
            if (s) s.sunk = true;

            // Notify?
            this.io.to(this.id).emit('event', { type: 'sunk', ship: s });
        } else {
            this.io.to(this.id).emit('event', { type: result.result, coord });
        }

        // Check win
        if (isGameOver(opponentBoard)) {
            this.state.phase = 'finished';
            this.state.winner = playerId;
        } else {
            // Swap turn
            this.state.turn = opponentId;
        }

        this.broadcastState();
    }

    // Redact opponent ships
    getMaskedState(forPlayerId: string): any {
        // Manually clone to preserve Maps or convert to serializable format directly

        // Helper to serialize a player board
        const serializeBoard = (board: PlayerBoard, showShips: boolean) => {
            return {
                ships: showShips ? board.ships : board.ships.filter(s => s.sunk),
                shots: Array.from(board.shots.entries())
            };
        };

        const serializedPlayers: any = {};
        for (const pid in this.state.players) {
            const isSelf = pid === forPlayerId;
            // Show ships if self OR if game over?
            const showShips = isSelf || this.state.phase === 'finished';
            serializedPlayers[pid] = serializeBoard(this.state.players[pid], showShips);
        }

        return {
            matchId: this.state.matchId,
            phase: this.state.phase,
            players: serializedPlayers,
            turn: this.state.turn,
            winner: this.state.winner
        };
    }

    sendStateTo(playerId: string) {
        const socket = this.socketMap.get(playerId);
        if (socket) {
            // State is already serialized (Maps -> Arrays) by getMaskedState logic above
            socket.emit('state_update', this.getMaskedState(playerId));
        }
    }

    broadcastState() {
        for (const pid of this.socketMap.keys()) {
            this.sendStateTo(pid);
        }
    }

    emitError(playerId: string, msg: string) {
        this.socketMap.get(playerId)?.emit('error', { message: msg });
    }

    serializeState(state: any): any {
        return state;
    }
}
