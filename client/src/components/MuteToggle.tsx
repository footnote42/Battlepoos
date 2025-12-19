import React, { useState } from 'react';
import { audioManager } from '../shared/audio';

const MuteToggle: React.FC = () => {
    const [isMuted, setIsMuted] = useState(audioManager.isMuted());

    const handleToggle = () => {
        const newMutedState = audioManager.toggleMute();
        setIsMuted(newMutedState);
    };

    return (
        <button
            onClick={handleToggle}
            className="fixed top-4 right-4 z-50 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 border-2 border-gray-300"
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
            <span className="text-2xl">
                {isMuted ? '🔇' : '🔊'}
            </span>
        </button>
    );
};

export default MuteToggle;
