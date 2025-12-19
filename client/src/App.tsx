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
        <div className="min-h-screen w-full flex flex-col items-center justify-start py-8 md:py-16">
            <div className="w-full max-w-6xl flex items-center justify-between px-6 mb-12">
                <div className="w-24"></div> {/* Spacer for centering */}
                <h1 className="text-4xl md:text-6xl font-black text-poo-brown drop-shadow-2xl animate-bounce-subtle">
                    💩 <span className="tracking-tighter">Battlepoos</span> 💩
                </h1>
                <div className="w-24 flex justify-end">
                    {showRestartButton && (
                        <button
                            onClick={handleRestartClick}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 text-xs tracking-widest uppercase"
                        >
                            🔄 Reset
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="w-full max-w-md bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-md mb-8 mx-auto cursor-pointer flex justify-between items-center" onClick={resetError}>
                    <span>{error}</span>
                    <span className="font-bold">×</span>
                </div>
            )}

            {/* Toasts */}
            <ToastContainer />

            <main className="w-full max-w-7xl px-4 flex flex-col items-center">
                <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 md:p-10 min-h-[600px] flex flex-col items-center relative overflow-hidden">
                    {renderPhase()}
                </div>
            </main>

            <ConfirmDialog
                isOpen={showRestartDialog}
                title="Flush Everything?"
                message="Are you sure you want to restart? This will wash away the current game for both players."
                onConfirm={handleConfirmRestart}
                onCancel={() => setShowRestartDialog(false)}
            />
        </div>
    );
}

export default App;
