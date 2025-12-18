import React from 'react';
import { useGameStore } from '../game/store';
import Board from './Board';

const Battle: React.FC = () => {
    const { gameState, playerId, fireShot } = useGameStore();

    if (!gameState || !playerId) return <div>Loading...</div>;

    const myBoard = gameState.players[playerId];
    const opponentId = Object.keys(gameState.players).find(id => id !== playerId);
    const opponentBoard = opponentId ? gameState.players[opponentId] : null;

    const isMyTurn = gameState.turn === playerId;

    return (
        <div className="flex flex-col items-center w-full animate-fade-in pb-8">
            <h2 className="text-3xl font-extrabold mb-2 text-poo-brown drop-shadow-sm">
                {isMyTurn ? "YOUR TURN! FIRE! 🔥" : "Opponent is aiming... 😰"}
            </h2>

            <div className="flex flex-col md:flex-row gap-8 mt-4 w-full justify-center">

                {/* Opponent Board (Target) */}
                <div className="flex flex-col items-center">
                    <h3 className="font-bold text-red-600 mb-2 text-xl">Target Area (Click to Fire)</h3>
                    <div className={`p-1 rounded-lg ${isMyTurn ? 'ring-4 ring-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'opacity-80 grayscale'}`}>
                        {opponentBoard && (
                            <Board
                                ships={opponentBoard.ships} // Will be empty/redacted
                                shots={opponentBoard.shots}
                                showShips={false} // Redundant but safe
                                interactive={isMyTurn}
                                onCellClick={(coord) => isMyTurn && fireShot(coord)}
                            />
                        )}
                    </div>
                </div>

                {/* Own Board */}
                <div className="flex flex-col items-center">
                    <h3 className="font-bold text-blue-600 mb-2 text-xl">Your Fleet</h3>
                    <div className="scale-75 md:scale-90 origin-top">
                        <Board
                            ships={myBoard.ships}
                            shots={myBoard.shots} // Shows where opponent hit us? 
                            // Wait, logic check: gameState.players[myId].shots stores MY shots fired or shots hitting ME?
                            // In Match.ts: "opponentBoard.shots.set(key, result)" when I fire.
                            // So opponentBoard.shots = shots taken AGAINST opponent.
                            // So myBoard.shots = shots taken AGAINST me.
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
