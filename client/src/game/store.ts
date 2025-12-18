import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, Ship, Coordinate } from '../shared/types'; // We'll move files shortly

// Define store interface
interface GameStore {
    socket: Socket | null;
    gameState: GameState | null;
    playerId: string | null;
    error: string | null;

    connect: () => void;
    createMatch: () => Promise<string>;
    joinMatch: (matchId: string) => void;
    placeShips: (ships: Ship[]) => void;
    fireShot: (coord: Coordinate) => void;
    resetError: () => void;
}

export const useGameStore = create<GameStore>((set: any, get: any) => ({
    socket: null,
    gameState: null,
    playerId: null,
    error: null,

    connect: () => {
        if (get().socket) return;
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to server', socket.id);
            set({ socket, playerId: socket.id });
        });

        socket.on('state_update', (state: any) => {
            if (state.players) {
                for (const pid in state.players) {
                    const p = state.players[pid];
                    if (Array.isArray(p.shots)) {
                        p.shots = new Map(p.shots);
                    }
                }
            }
            console.log('State Update:', state);
            set({ gameState: state });
        });

        socket.on('error', (err: { message: string }) => {
            set({ error: err.message });
        });

        socket.on('event', (evt: any) => {
            console.log('Game Event', evt);
            // Dynamic import to avoid circular dep issues mostly, but we can import top level
            import('../shared/audio').then(m => {
                if (evt.type === 'hit') m.audioManager.play('hit');
                if (evt.type === 'miss') m.audioManager.play('miss');
                if (evt.type === 'sunk') m.audioManager.play('sink');
            });

            // Toasts via dynamic import or just let component handle? 
            // Better to decouple store from UI components, but we are inside a hook effectively.
            // Let's lazy import the store to avoid cyclical issues if any, though store->store is usually fine.
            import('./toastStore').then(ts => {
                if (evt.type === 'sunk') ts.useToastStore.getState().addToast(`You sunk a ${evt.ship.type}!`, 'success');
                if (evt.type === 'hit') ts.useToastStore.getState().addToast('Hit!', 'success');
                if (evt.type === 'miss') ts.useToastStore.getState().addToast('Miss!', 'info');
            });
        });
    },

    createMatch: async () => {
        // REST call
        const res = await fetch('http://localhost:3000/api/match', { method: 'POST' });
        const data = await res.json();
        return data.matchId;
    },

    joinMatch: (matchId: string) => {
        // If not connected, wait? Assumes connected.
        const { socket, playerId } = get();
        if (socket) {
            socket.emit('join_match', { matchId, playerId });
        }
    },

    placeShips: (ships: Ship[]) => {
        const { socket } = get();
        if (socket) socket.emit('place_ships', ships);
    },

    fireShot: (coord: Coordinate) => {
        const { socket } = get();
        if (socket) socket.emit('fire_shot', coord);
    },

    resetError: () => set({ error: null })
}));
