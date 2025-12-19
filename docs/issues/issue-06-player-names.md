# Issue #6: Add Player Name Entry

**Priority:** P2 (Personalization)  
**Estimated Effort:** 2-3 hours  
**Phase:** 3 - Engagement Features  
**Dependencies:** None  
**Status:** NOT STARTED

---

## Problem Statement

Players are currently identified as generic "Player 1" / "Player 2", which is impersonal and less engaging, especially for kids.

---

## Acceptance Criteria

- [ ] Name entry screen before game starts (lobby/matchmaking)
- [ ] Character limit (12 chars max)
- [ ] Names displayed during gameplay (turn indicators, game-over screen)
- [ ] Input validation (no empty, no special chars that break display)
- [ ] Default names if skipped ("Player 1", "Player 2")

---

## Implementation

```tsx
const [playerName, setPlayerName] = useState('');

<input 
  type="text"
  maxLength={12}
  placeholder="Enter your name"
  value={playerName}
  onChange={(e) => setPlayerName(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ''))}
/>
```

**Storage:** localStorage for persistence across sessions
**Server:** Send name with join/create game event

---

## Testing

- [ ] Enter name → appears in turn indicator
- [ ] Enter name → appears in game-over ("Wayne wins!")
- [ ] Skip name → defaults to "Player 1"
- [ ] Try special chars → stripped/rejected
- [ ] Refresh → name persists (localStorage)

---

## Definition of Done

✅ Name entry works before game start
✅ Names displayed throughout game
✅ Validation prevents breaking display
✅ Stored in localStorage

**Time:** 2-3 hours