"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGameOver = exports.resolveShot = exports.isValidPlacement = exports.getShipCoordinates = exports.isValidCoordinate = void 0;
const types_1 = require("./types");
const isValidCoordinate = (c) => {
    return c.x >= 0 && c.x < types_1.BOARD_SIZE && c.y >= 0 && c.y < types_1.BOARD_SIZE;
};
exports.isValidCoordinate = isValidCoordinate;
const getShipCoordinates = (ship) => {
    const coords = [];
    const length = types_1.SHIP_LENGTHS[ship.type];
    for (let i = 0; i < length; i++) {
        coords.push({
            x: ship.orientation === 'horizontal' ? ship.position.x + i : ship.position.x,
            y: ship.orientation === 'vertical' ? ship.position.y + i : ship.position.y,
        });
    }
    return coords;
};
exports.getShipCoordinates = getShipCoordinates;
const isValidPlacement = (ship, existingShips) => {
    const shipCoords = (0, exports.getShipCoordinates)(ship);
    // Check bounds
    for (const c of shipCoords) {
        if (!(0, exports.isValidCoordinate)(c))
            return false;
    }
    // Check overlap using a set for O(1) lookup effectively, though small N makes array fine.
    const occupied = new Set();
    for (const s of existingShips) {
        if (s.id === ship.id)
            continue; // Don't check against self if moving
        for (const c of (0, exports.getShipCoordinates)(s)) {
            occupied.add(`${c.x},${c.y}`);
        }
    }
    for (const c of shipCoords) {
        if (occupied.has(`${c.x},${c.y}`))
            return false;
    }
    return true;
};
exports.isValidPlacement = isValidPlacement;
const resolveShot = (board, target) => {
    const key = `${target.x},${target.y}`;
    // Already shot? In a robust system, we check this higher up, but safe to return miss or error.
    // Here we assume validation happens before calling resolveShot if possible, 
    // but let's just check if it hit anything.
    let hitShip;
    for (const ship of board.ships) {
        const coords = (0, exports.getShipCoordinates)(ship);
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
    const shipCoords = (0, exports.getShipCoordinates)(hitShip);
    let hits = 0;
    for (const c of shipCoords) {
        if ((c.x === target.x && c.y === target.y) || board.shots.has(`${c.x},${c.y}`)) {
            hits++;
        }
    }
    const sunk = hits >= types_1.SHIP_LENGTHS[hitShip.type];
    return {
        result: sunk ? 'sunk' : 'hit',
        shipSunk: sunk ? hitShip : undefined
    };
};
exports.resolveShot = resolveShot;
const isGameOver = (board) => {
    // If all ships are sunk
    // We can track sunk status on ships or just re-calculate
    return board.ships.every(s => s.sunk);
};
exports.isGameOver = isGameOver;
