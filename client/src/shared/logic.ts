import {
    Coordinate,
    Ship,
    BOARD_SIZE,
    SHIP_LENGTHS,
    PlayerBoard
} from './types';

export const isValidCoordinate = (c: Coordinate): boolean => {
    return c.x >= 0 && c.x < BOARD_SIZE && c.y >= 0 && c.y < BOARD_SIZE;
};

export const getShipCoordinates = (ship: Ship): Coordinate[] => {
    const coords: Coordinate[] = [];
    const length = SHIP_LENGTHS[ship.type];

    for (let i = 0; i < length; i++) {
        coords.push({
            x: ship.orientation === 'horizontal' ? ship.position.x + i : ship.position.x,
            y: ship.orientation === 'vertical' ? ship.position.y + i : ship.position.y,
        });
    }
    return coords;
};

export const isValidPlacement = (
    ship: Ship,
    existingShips: Ship[]
): boolean => {
    const shipCoords = getShipCoordinates(ship);

    // Check bounds
    for (const c of shipCoords) {
        if (!isValidCoordinate(c)) return false;
    }

    // Check overlap using a set for O(1) lookup effectively, though small N makes array fine.
    const occupied = new Set<string>();
    for (const s of existingShips) {
        if (s.id === ship.id) continue; // Don't check against self if moving
        for (const c of getShipCoordinates(s)) {
            occupied.add(`${c.x},${c.y}`);
        }
    }

    for (const c of shipCoords) {
        if (occupied.has(`${c.x},${c.y}`)) return false;
    }

    return true;
};

export type ShotResult = 'miss' | 'hit' | 'sunk';

export const resolveShot = (
    board: PlayerBoard,
    target: Coordinate
): { result: ShotResult; shipSunk?: Ship } => {


    // Already shot? In a robust system, we check this higher up, but safe to return miss or error.
    // Here we assume validation happens before calling resolveShot if possible, 
    // but let's just check if it hit anything.

    let hitShip: Ship | undefined;

    for (const ship of board.ships) {
        const coords = getShipCoordinates(ship);
        if (coords.some(c => c.x === target.x && c.y === target.y)) {
            hitShip = ship;
            break;
        }
    }

    if (!hitShip) {
        return { result: 'miss' };
    }

    // It's a hit. Update ship state (this mutates the object pass-by-reference style which is fine for now)
    // Ideally we return a new state, but for simplicity we assume the caller manages the state update or we return copies.
    // For this function, let's treat it as a calculation function.
    // Wait, the caller needs to update the ship's hit counter.

    // Re-calculating hits from shots map + this new shot?
    // Let's assume the board.shots is updated *after* this result or the caller handles it.

    // Actually, to know if it's sunk, we need to know previous hits.
    // Let's count hits based on the shots map PLUS this new shot.

    const shipCoords = getShipCoordinates(hitShip);
    let hits = 0;
    for (const c of shipCoords) {
        if ((c.x === target.x && c.y === target.y) || board.shots.has(`${c.x},${c.y}`)) {
            hits++;
        }
    }

    const sunk = hits >= SHIP_LENGTHS[hitShip.type];

    return {
        result: sunk ? 'sunk' : 'hit',
        shipSunk: sunk ? hitShip : undefined
    };
};

export const isGameOver = (board: PlayerBoard): boolean => {
    // If all ships are sunk
    // We can track sunk status on ships or just re-calculate
    return board.ships.every(s => s.sunk);
};
