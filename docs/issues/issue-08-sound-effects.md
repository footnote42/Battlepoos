# Issue #8: Add Sound Effects

**Priority:** P2 (Polish)  
**Estimated Effort:** 2-3 hours  
**Phase:** 3 - Engagement Features  
**Dependencies:** None  
**Status:** NOT STARTED

---

## Problem Statement

Silent gameplay lacks feedback and excitement. Sound effects enhance hit/miss clarity and make the game more engaging.

---

## Acceptance Criteria

- [ ] Sound effects for: hit, miss, ship sunk, game over (win/loss), turn change
- [ ] Sounds are short (<2 seconds), non-annoying
- [ ] Mute/unmute toggle accessible during gameplay
- [ ] Volume control (optional: simple on/off for v1)
- [ ] Sounds don't play if tab not in focus
- [ ] Works on mobile and desktop (respects autoplay policies)

---

## Implementation

**Sound Files:**
- Free libraries: Freesound.org, ZapSplat
- Theme: Playful, cartoony (not realistic/violent)
- Hit: Splash/plop; Miss: Drop/fizzle; Sink: Bubbling; Win: Fanfare; Loss: Sad trombone

```typescript
class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private muted: boolean = false;
  
  constructor() {
    this.loadSound('hit', '/sounds/hit.mp3');
    this.loadSound('miss', '/sounds/miss.mp3');
    this.loadSound('sink', '/sounds/sink.mp3');
    this.loadSound('win', '/sounds/win.mp3');
    this.loadSound('lose', '/sounds/lose.mp3');
    
    // Load mute preference from localStorage
    this.muted = localStorage.getItem('battlepoos_muted') === 'true';
  }
  
  private loadSound(name: string, path: string) {
    const audio = new Audio(path);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }
  
  play(soundName: string) {
    if (this.muted || document.hidden) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0; // Reset to start
      sound.play().catch(err => console.log('Audio play failed:', err));
    }
  }
  
  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('battlepoos_muted', String(this.muted));
    return this.muted;
  }
}

// Usage
const soundManager = new SoundManager();
soundManager.play('hit'); // On hit event
soundManager.play('miss'); // On miss event
```

**Mute Toggle:**
```tsx
<button onClick={() => {
  const muted = soundManager.toggleMute();
  setIsMuted(muted);
}}>
  {isMuted ? '🔇' : '🔊'}
</button>
```

---

## Testing

- [ ] All sound events trigger correctly (hit, miss, sink, win, lose)
- [ ] Mute toggle works (persists across page refresh)
- [ ] No audio glitches or overlapping sounds
- [ ] Respects browser autoplay policies (user interaction required)
- [ ] Works on iOS Safari (strict autoplay policies)

---

## Definition of Done

✅ Sounds play for key game events
✅ Mute toggle works and persists
✅ No autoplay policy violations
✅ Tested on mobile and desktop

**Time:** 2-3 hours