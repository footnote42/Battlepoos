export type Coordinate = {
    x: number;
    y: number;
};

export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

export type Orientation = 'horizontal' | 'vertical';

export interface Ship {
    id: string; // unique instance ID
    type: ShipType;
    position: Coordinate; // Top-left anchor
    orientation: Orientation;
    hits: number;
    sunk: boolean;
}

export type CellState = 'empty' | 'miss' | 'hit' | 'sunk';

export interface PlayerBoard {
    ships: Ship[];
    shots: Map<string, CellState>; // Key: "x,y", Value: State
}

export type GamePhase = 'lobby' | 'placement' | 'active' | 'finished';

export interface GameState {
    matchId: string;
    phase: GamePhase;
    players: {
        [playerId: string]: PlayerBoard;
    };
    turn: string; // playerId of current turn
    winner: string | null;
}

export const BOARD_SIZE = 10;

export const SHIP_LENGTHS: Record<ShipType, number> = {
    carrier: 5,
    battleship: 4,
    cruiser: 3,
    submarine: 3,
    destroyer: 2,
};

export const TOTAL_SHIPS_PER_PLAYER = 5;
