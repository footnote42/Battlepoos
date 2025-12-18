import { isValidPlacement, resolveShot } from './logic';
import { Ship, PlayerBoard, Coordinate, ShipType } from './types';

// Mock data
const carrier: Ship = {
    id: 's1',
    type: 'carrier',
    position: { x: 0, y: 0 },
    orientation: 'horizontal',
    hits: 0,
    sunk: false
};

const destroyer: Ship = {
    id: 's2',
    type: 'destroyer',
    position: { x: 0, y: 1 },
    orientation: 'horizontal',
    hits: 0,
    sunk: false
};

// Test Placement
const testPlacement = () => {
    console.log('Testing Placement...');
    const ships: Ship[] = [carrier];

    // Valid non-overlapping
    const valid = isValidPlacement(destroyer, ships);
    console.log(`Valid placement (expect true): ${valid}`);

    // Overlapping
    const overlappingShip: Ship = { ...destroyer, position: { x: 0, y: 0 } };
    const invalid = isValidPlacement(overlappingShip, ships);
    console.log(`Overlapping placement (expect false): ${invalid}`);

    // Out of bounds
    const oobShip: Ship = { ...carrier, position: { x: 8, y: 0 } }; // length 5, starts at 8 -> 8,9,10,11,12 (OOB)
    const invalidOob = isValidPlacement(oobShip, ships);
    console.log(`OOB placement (expect false): ${invalidOob}`);
};

// Test Shot Resolution
const testShots = () => {
    console.log('\nTesting Shots...');
    const board: PlayerBoard = {
        ships: [carrier],
        shots: new Map()
    };

    // Miss
    const resMiss = resolveShot(board, { x: 0, y: 1 });
    console.log(`Miss (expect miss): ${resMiss.result}`);

    // Hit
    const resHit = resolveShot(board, { x: 0, y: 0 });
    console.log(`Hit (expect hit): ${resHit.result}`);

    // Sinking
    // Simulate hits on 0,0 1,0 2,0 3,0 4,0
    board.shots.set('0,0', 'hit');
    board.shots.set('1,0', 'hit');
    board.shots.set('2,0', 'hit');
    board.shots.set('3,0', 'hit');
    // Final shot at 4,0
    const resSink = resolveShot(board, { x: 4, y: 0 });
    console.log(`Sink (expect sunk): ${resSink.result}`);
    if (resSink.shipSunk) {
        console.log(`Sunk ship type (expect carrier): ${resSink.shipSunk.type}`);
    }
};

testPlacement();
testShots();
