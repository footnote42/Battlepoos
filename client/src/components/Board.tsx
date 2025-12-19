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
    previewShip?: Ship | null;
    isValidPreview?: boolean;
    onCellHover?: (coord: Coordinate | null) => void;
}

const Board: React.FC<BoardProps> = ({
    ships = [],
    shots,
    onCellClick,
    showShips = false,
    interactive = false,
    previewShip = null,
    isValidPreview = false,
    onCellHover
}) => {
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
        return shots.get(`${x},${y}`);
    };

    // Check if cell is part of preview
    const isPreviewAt = (x: number, y: number) => {
        if (!previewShip) return false;
        return getShipCoordinates(previewShip).some(c => c.x === x && c.y === y);
    };

    return (
        <div
            className="grid gap-1 bg-blue-200 p-2 rounded border-4 border-blue-400 select-none shadow-inner"
            style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
            onMouseLeave={() => onCellHover && onCellHover(null)}
        >
            {grid.map((row, y) => (
                row.map((_, x) => {
                    const ship = getShipAt(x, y);
                    const shot = getShotAt(x, y);
                    const isPreview = isPreviewAt(x, y);

                    // Determine background color
                    let bgColor = "bg-white/80";
                    if (isPreview) {
                        bgColor = isValidPreview ? "bg-green-400/70" : "bg-red-400/70";
                    } else if (ship) {
                        bgColor = "bg-gray-600";
                    } else if (shot === 'miss') {
                        bgColor = "bg-white";
                    } else if (shot === 'hit') {
                        bgColor = "bg-red-500";
                    } else if (shot === 'sunk') {
                        bgColor = "bg-poo-brown animate-bounce";
                    }

                    // Hover effect only if interactive and not previewing over it (preview handles its own look mostly, 
                    // but we can keep hover if not previewing)
                    const hoverClass = (interactive && !shot && !isPreview && !ship) ? "hover:bg-blue-300" : "";

                    return (
                        <div
                            key={`${x},${y}`}
                            onClick={() => {
                                if (interactive && onCellClick) {
                                    if (!isPreview || isValidPreview) {
                                        import('../shared/audio').then(m => m.audioManager.play('place'));
                                        onCellClick({ x, y });
                                    } else {
                                        // Error sound?
                                    }
                                }
                            }}
                            onMouseEnter={() => {
                                if (interactive && onCellHover) {
                                    onCellHover({ x, y });
                                }
                            }}
                            className={clsx(
                                "w-8 h-8 md:w-10 md:h-10 border border-blue-300 rounded flex items-center justify-center text-lg transition-colors cursor-pointer",
                                hoverClass,
                                bgColor
                            )}
                        >
                            {shot === 'miss' && '💧'}
                            {shot === 'hit' && '💥'}
                            {shot === 'sunk' && '💩'}
                            {!shot && ship && !isPreview && '🚢'}
                            {isPreview && isValidPreview && '🚢'}
                            {isPreview && !isValidPreview && '❌'}
                        </div>
                    );
                })
            ))}
        </div>
    );
};

export default Board;
