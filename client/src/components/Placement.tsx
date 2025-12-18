import { useState } from 'react';
import { useGameStore } from '../game/store';
import Board from './Board';
import { Ship, ShipType, SHIP_LENGTHS, Coordinate } from '../shared/types';
import { isValidPlacement } from '../shared/logic';
// Simple ID generator if uuid fails or for simplicity
const generateId = () => Math.random().toString(36).substr(2, 9);

const Placement: React.FC = () => {
    const { placeShips } = useGameStore();
    const [ships, setShips] = useState<Ship[]>([]);
    const [selectedType, setSelectedType] = useState<ShipType | null>('carrier');
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
    const [placedTypes, setPlacedTypes] = useState<Set<ShipType>>(new Set());

    // Available ships
    const availableShips: ShipType[] = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];

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
        } else {
            // Feedback?
            alert("Invalid placement! Overlap or out of bounds."); // Replace with toast later
        }
    };

    const handleReset = () => {
        setShips([]);
        setPlacedTypes(new Set());
        setSelectedType('carrier');
    };

    const handleConfirm = () => {
        if (ships.length === 5) {
            placeShips(ships);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start animate-fade-in p-4">
            <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4 text-poo-brown">Place Your Poo Fleet</h2>
                <p className="mb-4 text-gray-600">Tap grid to place. Rotate before placing.</p>

                <Board ships={ships} showShips={true} interactive={true} onCellClick={handleCellClick} />

                <div className="mt-4 flex gap-4">
                    <button onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')} className="px-4 py-2 bg-blue-500 text-white rounded shadow">
                        Rotate: {orientation.toUpperCase()}
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
