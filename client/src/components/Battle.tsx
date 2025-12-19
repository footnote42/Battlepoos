import React from 'react';
import { useGameStore } from '../game/store';
import Board from './Board';
import MuteToggle from './MuteToggle';
import clsx from 'clsx';

const Battle: React.FC = () => {
    const { gameState, playerId, fireShot } = useGameStore();

    if (!gameState || !playerId) return <div>Loading...</div>;

    const myBoard = gameState.players[playerId];
    const opponentId = Object.keys(gameState.players).find(id => id !== playerId);
    const opponentBoard = opponentId ? gameState.players[opponentId] : null;

    const isMyTurn = gameState.turn === playerId;

    return (
        <div className="flex flex-col items-center w-full animate-fade-in pb-12">
            <MuteToggle />
            <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-poo-brown drop-shadow-sm text-center px-4">
                {isMyTurn ? "YOUR TURN! FIRE! 🔥" : "Opponent is aiming... 😰"}
            </h2>

            <div className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full max-w-7xl px-4">

                {/* Opponent Board (Target) */}
                <div className="flex flex-col items-center max-w-full">
                    <h3 className="font-bold text-red-600 mb-4 text-xl bg-red-50 px-4 py-1 rounded-full border border-red-100 shadow-sm">
                        Target Area
                    </h3>
                    <div className={clsx(
                        "p-2 rounded-xl transition-all duration-300 max-w-full overflow-auto",
                        isMyTurn ? "ring-8 ring-green-400/30 shadow-2xl bg-green-50/50" : "opacity-60 grayscale scale-95"
                    )}>
                        {opponentBoard && (
                            <Board
                                ships={opponentBoard.ships}
                                shots={opponentBoard.shots}
                                showShips={false}
                                interactive={isMyTurn}
                                onCellClick={(coord) => isMyTurn && fireShot(coord)}
                            />
                        )}
                    </div>
                </div>

                {/* Own Board */}
                <div className="flex flex-col items-center max-w-full">
                    <h3 className="font-bold text-blue-600 mb-4 text-xl bg-blue-50 px-4 py-1 rounded-full border border-blue-100 shadow-sm">
                        Your Fleet
                    </h3>
                    <div className="scale-90 md:scale-100 transition-transform origin-center">
                        <Board
                            ships={myBoard.ships}
                            shots={myBoard.shots}
                            showShips={true}
                            interactive={false}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Battle;
