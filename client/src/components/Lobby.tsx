import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import MuteToggle from './MuteToggle';

const Lobby: React.FC = () => {
    const { createMatch, joinMatch, gameState } = useGameStore();
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const id = await createMatch();
            // Auto join created match
            joinMatch(id);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode) return;
        joinMatch(joinCode.toUpperCase());
    };

    return (
        <div className="flex flex-col items-center space-y-8 animate-fade-in">
            <MuteToggle />
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700">Welcome to the Bathroom</h2>
                <p className="text-gray-500">Create a match or join a friend to start dropping... loads.</p>
            </div>

            {/* Show Match ID if in lobby */}
            {gameState && gameState.matchId && (
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Share this code with your opponent:</p>
                    <p className="text-3xl font-bold tracking-widest text-poo-brown">{gameState.matchId}</p>
                    <p className="text-xs text-gray-500 mt-2">Waiting for opponent to join...</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-lg">
                {/* Create */}
                <div className="flex-1 flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                    <h3 className="text-lg font-bold mb-4">Start New Game</h3>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-6 py-3 bg-poo-brown text-white rounded-lg font-bold hover:bg-poo-light transition shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        {loading ? 'Flushing...' : 'Create Match'}
                    </button>
                </div>

                {/* Join */}
                <form onSubmit={handleJoin} className="flex-1 flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition">
                    <h3 className="text-lg font-bold mb-4">Join Friend</h3>
                    <input
                        type="text"
                        placeholder="CODE"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="w-full text-center text-2xl uppercase tracking-widest border-2 border-gray-300 rounded mb-4 p-2 focus:border-poo-brown focus:outline-none"
                        maxLength={6}
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition shadow-lg"
                    >
                        Join
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Lobby;
