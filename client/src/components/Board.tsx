import React from 'react';
import { CellState, Coordinate, Ship, BOARD_SIZE } from '../shared/types';
import clsx from 'clsx';
import { getShipCoordinates } from '../shared/logic';

interface BoardProps {
    ships?: Ship[];
    shots?: Map<string, CellState>; // Using string key "x,y"
    onCellClick?: (coord: Coordinate) => void;
    showShips?: boolean;
    interactive?: boolean;
}

const Board: React.FC<BoardProps> = ({ ships = [], shots, onCellClick, showShips = false, interactive = false }) => {
    const grid = Array(BOARD_SIZE).fill(null).map((_, y) =>
        Array(BOARD_SIZE).fill(null).map((_, x) => ({ x, y }))
    );

    // Helper to check if cell has ship
    // Using a map for performance is better but standard iteration fine for 10x10
    const getShipAt = (x: number, y: number) => {
        if (!showShips) return null;
        return ships.find(s =>
            getShipCoordinates(s).some(c => c.x === x && c.y === y)
        );
    };

    const getShotAt = (x: number, y: number) => {
        if (!shots) return null;
        return shots.get(`${x},${y}`); // Map might come as array from server, we need to handle that in store
        // Oh wait, serialized state turns Map into Array of entries.
        // Store needs to deserialize it back to Map or we accept key-value object/array here.
    };

    return (
        <div
            className="grid gap-1 bg-blue-200 p-2 rounded border-4 border-blue-400 select-none shadow-inner"
            style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
        >
            {grid.map((row, y) => (
                row.map((_, x) => {
                    const ship = getShipAt(x, y);
                    const shot = getShotAt(x, y);

                    return (
                        <div
                            key={`${x},${y}`}
                            onClick={() => interactive && onCellClick?.({ x, y })}
                            className={clsx(
                                "w-8 h-8 md:w-10 md:h-10 border border-blue-300 rounded flex items-center justify-center text-lg transition-colors cursor-pointer",
                                interactive && !shot ? "hover:bg-blue-300" : "",
                                ship ? "bg-gray-600" : "bg-white/80", // Ship color
                                shot === 'miss' && "bg-white",
                                shot === 'hit' && "bg-red-500",
                                shot === 'sunk' && "bg-poo-brown animate-bounce"
                            )}
                        >
                            {shot === 'miss' && '💧'}
                            {shot === 'hit' && '💥'}
                            {shot === 'sunk' && '💩'}
                            {!shot && ship && '🚢'}
                        </div>
                    );
                })
            ))}
        </div>
    );
};

export default Board;
