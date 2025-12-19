import React from 'react';
import { useGameStore } from '../game/store';

interface GameOverProps {
    winnerId: string;
    currentPlayerId: string;
}

const GameOver: React.FC<GameOverProps> = ({ winnerId, currentPlayerId }) => {
    const isWinner = winnerId === currentPlayerId;
    const { restartGame, returnToLobby } = useGameStore();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
            <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 text-center transform transition-all ${
                isWinner
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-400'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-400'
            }`}>
                {/* Game Over Header */}
                <div className="mb-6">
                    <h1 className={`text-5xl font-bold mb-2 ${isWinner ? 'text-green-700' : 'text-gray-700'}`}>
                        {isWinner ? '🎉 Victory! 🎉' : '💀 Defeat 💀'}
                    </h1>
                    <p className={`text-xl ${isWinner ? 'text-green-600' : 'text-gray-600'}`}>
                        {isWinner
                            ? 'You flushed all enemy ships!'
                            : 'Your fleet went down the drain!'}
                    </p>
                </div>

                {/* Decorative divider */}
                <div className={`w-24 h-1 mx-auto mb-6 ${isWinner ? 'bg-green-400' : 'bg-gray-400'}`}></div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={restartGame}
                        className="w-full px-6 py-4 bg-poo-brown text-white rounded-lg font-bold text-lg hover:bg-poo-light transition shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        💩 Play Again 💩
                    </button>
                    <button
                        onClick={returnToLobby}
                        className="w-full px-6 py-4 bg-gray-600 text-white rounded-lg font-bold text-lg hover:bg-gray-700 transition shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        🚪 Return to Lobby
                    </button>
                </div>

                {/* Flavor Text */}
                <div className="mt-6 pt-6 border-t-2 border-gray-300">
                    <p className="text-sm text-gray-600 italic">
                        {isWinner
                            ? 'You are the champion of the porcelain throne!'
                            : 'Better luck next flush!'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GameOver;
