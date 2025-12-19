// Simple Audio Manager
// In a real app, use Howler.js for better cross-browser consistency
// For now, we'll use native Audio with placeholder URLs or Base64

class AudioManager {
    private sounds: Record<string, HTMLAudioElement> = {};
    private muted: boolean = false;

    constructor() {
        this.muted = localStorage.getItem('battlepoos_muted') === 'true';
        this.preload();
    }

    // Placeholder sounds - replace with real assets later
    // Using short data URIs or public placeholders if available.
    // For this demo, we'll just log or use empty generic beeps if we don't have files.
    private preload() {
        this.sounds['hit'] = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-farting-balloon-3047.mp3'); // Fart-like
        this.sounds['miss'] = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-water-splash-1311.mp3'); // Splash
        this.sounds['sink'] = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-animated-small-group-applause-523.mp3'); // Cheer
        this.sounds['place'] = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'); // Plop/Click
        this.sounds['win'] = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-video-game-win-2016.mp3'); // Victory fanfare
        this.sounds['lose'] = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3'); // Sad loss sound
    }

    play(key: string) {
        // Don't play if muted or tab is not in focus
        if (this.muted || document.hidden) return;

        const sound = this.sounds[key];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn("Audio play failed (interaction needed first):", e));
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('battlepoos_muted', String(this.muted));
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }
}

export const audioManager = new AudioManager();
