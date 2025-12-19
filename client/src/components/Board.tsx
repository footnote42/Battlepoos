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
            className="grid gap-0.5 bg-blue-200 p-1 rounded-lg border-2 border-blue-400 select-none shadow-xl overflow-hidden"
            style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, var(--fluid-cell-size))`,
                width: 'fit-content'
            }}
            onMouseLeave={() => onCellHover && onCellHover(null)}
        >
            {grid.map((row, y) => (
                row.map((_, x) => {
                    const ship = getShipAt(x, y);
                    const shot = getShotAt(x, y);
                    const isPreview = isPreviewAt(x, y);

                    // Determine background color
                    let bgColor = "bg-white/90";
                    if (isPreview) {
                        bgColor = isValidPreview ? "bg-green-400/80" : "bg-red-400/80";
                    } else if (ship) {
                        bgColor = "bg-gray-700";
                    } else if (shot === 'miss') {
                        bgColor = "bg-blue-50";
                    } else if (shot === 'hit') {
                        bgColor = "bg-red-500";
                    } else if (shot === 'sunk') {
                        bgColor = "bg-orange-900 animate-pulse";
                    }

                    // Hover effect
                    const hoverClass = (interactive && !shot && !isPreview && !ship) ? "hover:bg-blue-100" : "";

                    return (
                        <div
                            key={`${x},${y}`}
                            onClick={() => {
                                if (interactive && onCellClick) {
                                    if (!isPreview || isValidPreview) {
                                        import('../shared/audio').then(m => m.audioManager.play('place'));
                                        onCellClick({ x, y });
                                    }
                                }
                            }}
                            onMouseEnter={() => {
                                if (interactive && onCellHover) {
                                    onCellHover({ x, y });
                                }
                            }}
                            className={clsx(
                                "aspect-square border border-blue-200/50 flex items-center justify-center text-lg transition-all duration-150 cursor-pointer",
                                hoverClass,
                                bgColor
                            )}
                            style={{ width: 'var(--fluid-cell-size)', height: 'var(--fluid-cell-size)' }}
                        >
                            {shot === 'miss' && <span className="text-blue-400 opacity-60">💧</span>}
                            {shot === 'hit' && <span className="animate-bounce">💥</span>}
                            {shot === 'sunk' && <span className="scale-125">💩</span>}
                            {!shot && ship && !isPreview && <span className="opacity-90">🚢</span>}
                            {isPreview && isValidPreview && <span className="opacity-50">🚢</span>}
                            {isPreview && !isValidPreview && <span className="opacity-50">❌</span>}
                        </div>
                    );
                })
            ))}
        </div>
    );
};

export default Board;
