import { useState, useEffect } from 'react';
import ConfirmDialog from './components/ConfirmDialog';
import { useGameStore } from './game/store';
import Lobby from './components/Lobby';
import Placement from './components/Placement';
import Battle from './components/Battle';
import { ToastContainer } from './components/ToastContainer';
import GameOver from './components/GameOver';

function App() {
    const [showRestartDialog, setShowRestartDialog] = useState(false);
    const { connect, gameState, playerId, error, resetError, restartGame } = useGameStore();

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
                return <GameOver winnerId={gameState.winner || ''} currentPlayerId={playerId || ''} />;
            default:
                return <div>Unknown Phase: {gameState.phase}</div>;
        }
    };

    const handleRestartClick = () => {
        setShowRestartDialog(true);
    };

    const handleConfirmRestart = () => {
        restartGame();
        setShowRestartDialog(false);
    };

    const showRestartButton = gameState && gameState.phase !== 'lobby' && gameState.phase !== 'finished';

    return (
        <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl flex items-center justify-between mb-8">
                <div className="w-24"></div> {/* Spacer for centering */}
                <h1 className="text-4xl font-bold text-poo-brown drop-shadow-md">💩 Battlepoos 💩</h1>
                <div className="w-24 flex justify-end">
                    {showRestartButton && (
                        <button
                            onClick={handleRestartClick}
                            className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded shadow transition text-sm"
                        >
                            🔄 Restart
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 cursor-pointer" onClick={resetError}>
                    {error}
                </div>
            )}

            {/* Toasts */}
            <ToastContainer />

            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 min-h-[600px]">
                {renderPhase()}
            </div>

            <ConfirmDialog
                isOpen={showRestartDialog}
                title="Restart Game?"
                message="Are you sure you want to restart? This will end the current game for both players."
                onConfirm={handleConfirmRestart}
                onCancel={() => setShowRestartDialog(false)}
            />
        </div>
    );
}

export default App;
