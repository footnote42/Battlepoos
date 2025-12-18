import { useEffect } from 'react';
import { useGameStore } from './game/store';
import Lobby from './components/Lobby';
import Placement from './components/Placement';
import Battle from './components/Battle';
// import GameOver from './components/GameOver';

function App() {
    const { connect, gameState, error, resetError } = useGameStore();

    useEffect(() => {
        connect();
    }, [connect]);

    // Simple Router based on Phase
    const renderPhase = () => {
        if (!gameState) return <Lobby />; // Or Loading? Lobby handles uninitialized state

        switch (gameState.phase) {
            case 'lobby':
                return <Lobby />;
            case 'placement':
                return <Placement />;
            case 'active':
                return <Battle />;
            case 'finished':
                return <div>Game Over! Winner: {gameState.winner}</div>;
            default:
                return <div>Unknown Phase: {gameState.phase}</div>;
        }
    };

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-poo-brown mb-8 drop-shadow-md">💩 Battlepoos 💩</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 cursor-pointer" onClick={resetError}>
                    {error}
                </div>
            )}

            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 min-h-[600px]">
                {renderPhase()}
            </div>
        </div>
    );
}

export default App;
