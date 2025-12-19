import { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import Board from './Board';
import { Ship, ShipType, SHIP_LENGTHS, Coordinate } from '../shared/types';
import { isValidPlacement } from '../shared/logic';
import MuteToggle from './MuteToggle';
// Simple ID generator if uuid fails or for simplicity
const generateId = () => Math.random().toString(36).substr(2, 9);

const Placement: React.FC = () => {
    const { placeShips } = useGameStore();
    const [ships, setShips] = useState<Ship[]>([]);
    const [selectedType, setSelectedType] = useState<ShipType | null>('carrier');
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
    const [placedTypes, setPlacedTypes] = useState<Set<ShipType>>(new Set());

    const [hoveredCell, setHoveredCell] = useState<Coordinate | null>(null);

    // Available ships
    const availableShips: ShipType[] = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];

    // Keyboard rotation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
                e.preventDefault(); // Prevent scrolling with space
                setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const previewShip: Ship | null = (selectedType && hoveredCell) ? {
        id: 'preview',
        type: selectedType,
        position: hoveredCell,
        orientation,
        hits: 0,
        sunk: false
    } : null;

    const isValidPreview = previewShip ? isValidPlacement(previewShip, ships) : false;

    const handleCellClick = (coord: Coordinate) => {
        if (!selectedType) return;
        if (placedTypes.has(selectedType)) return;

        const newShip: Ship = {
            id: generateId(),
            type: selectedType,
            position: coord,
            orientation,
            hits: 0,
            sunk: false
        };

        if (isValidPlacement(newShip, ships)) {
            setShips([...ships, newShip]);
            setPlacedTypes(new Set(placedTypes).add(selectedType));

            // Auto select next available
            const next = availableShips.find(t => !placedTypes.has(t) && t !== selectedType);
            setSelectedType(next || null);
            setHoveredCell(null); // Clear hover to update preview immediately/avoid stale
        } else {
            // Toast handled by board invalid preview visual mostly, but keep just in case
        }
    };



    const handleConfirm = () => {
        if (ships.length === 5) {
            placeShips(ships);
        }
    };

    const handleReset = () => {
        setShips([]);
        setPlacedTypes(new Set());
        setSelectedType('carrier');
    };

    const handleRandomize = () => {
        let attempts = 0;
        while (attempts < 100) {
            const newShips: Ship[] = [];
            const newPlaced = new Set<ShipType>();
            let possible = true;

            for (const type of availableShips) {
                let placed = false;
                let subAttempts = 0;
                while (!placed && subAttempts < 50) {
                    const o: 'horizontal' | 'vertical' = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                    const x = Math.floor(Math.random() * 10);
                    const y = Math.floor(Math.random() * 10);
                    const candidate: Ship = {
                        id: generateId(),
                        type,
                        position: { x, y },
                        orientation: o,
                        hits: 0,
                        sunk: false
                    };

                    if (isValidPlacement(candidate, newShips)) {
                        newShips.push(candidate);
                        newPlaced.add(type);
                        placed = true;
                    }
                    subAttempts++;
                }
                if (!placed) {
                    possible = false;
                    break;
                }
            }

            if (possible) {
                setShips(newShips);
                setPlacedTypes(newPlaced);
                setSelectedType(null);
                return;
            }
            attempts++;
        }
        alert("Failed to randomize, try again.");
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start animate-fade-in p-4">
            <MuteToggle />
            <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4 text-poo-brown">Place Your Poo Fleet</h2>
                <p className="mb-4 text-gray-600">Tap grid to place. Rotate with 'R', Space, or button.</p>

                <Board
                    ships={ships}
                    showShips={true}
                    interactive={true}
                    onCellClick={handleCellClick}
                    onCellHover={setHoveredCell}
                    previewShip={previewShip}
                    isValidPreview={isValidPreview}
                />

                <div className="mt-4 flex gap-4">
                    <button onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')} className="px-4 py-2 bg-blue-500 text-white rounded shadow">
                        Rotate: {orientation.toUpperCase()}
                    </button>
                    <button onClick={handleRandomize} className="px-4 py-2 bg-purple-500 text-white rounded shadow">
                        Randomize 🎲
                    </button>
                    <button onClick={handleReset} className="px-4 py-2 bg-red-400 text-white rounded shadow">
                        Reset
                    </button>
                </div>
            </div>

            <div className="w-full md:w-64 bg-white p-4 rounded shadow-lg">
                <h3 className="font-bold mb-4">Fleet Status</h3>
                <div className="space-y-2">
                    {availableShips.map(type => (
                        <div
                            key={type}
                            onClick={() => !placedTypes.has(type) && setSelectedType(type)}
                            className={`p-2 rounded cursor-pointer border-2 transition ${placedTypes.has(type) ? 'bg-gray-200 border-gray-300 opacity-50 line-through' :
                                selectedType === type ? 'bg-blue-100 border-blue-500 font-bold' : 'border-transparent hover:bg-gray-50'
                                }`}
                        >
                            {type.toUpperCase()} ({SHIP_LENGTHS[type]})
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={ships.length < 5}
                    className={`mt-8 w-full py-3 rounded text-xl font-bold transition shadow-lg ${ships.length === 5 ? 'bg-green-500 text-white hover:bg-green-600 animate-pulse' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    Confirm Deployment 🚀
                </button>
            </div>
        </div>
    );
};

export default Placement;
