# Issue #7: Implement Scoring System (Wins Across Games)

**Priority:** P2 (Engagement)  
**Estimated Effort:** 3-4 hours  
**Phase:** 3 - Engagement Features  
**Dependencies:** Issue #6 (Player Names) recommended  
**Status:** NOT STARTED

---

## Problem Statement

No tracking of wins across multiple games reduces replay value. Players (especially kids) want to track their victories.

---

## Acceptance Criteria

- [ ] Win/loss count displayed for each player
- [ ] Score updates after each game completion
- [ ] Score visible during game and on game-over screen
- [ ] "Reset Scores" button (with confirmation)
- [ ] Scores persist in browser (localStorage)
- [ ] Optional: Win/loss ratio or streak count

---

## Implementation

```typescript
interface PlayerScore {
  name: string;
  wins: number;
  losses: number;
}

// localStorage keys
const STORAGE_KEY_SCORES = 'battlepoos_scores';

function updateScore(winnerId: string) {
  const scores = JSON.parse(localStorage.getItem(STORAGE_KEY_SCORES) || '{}');
  scores[winnerId] = (scores[winnerId] || 0) + 1;
  localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(scores));
}
```

**Display:**
```tsx
<div className="scoreboard">
  <div className="player-score">
    <span>{player1Name}</span>
    <span>{player1Wins} wins</span>
  </div>
  <div className="player-score">
    <span>{player2Name}</span>
    <span>{player2Wins} wins</span>
  </div>
</div>
```

---

## Testing

- [ ] Play 3 games → score updates correctly
- [ ] Refresh browser → scores persist
- [ ] Click "Reset Scores" → scores return to 0
- [ ] Tie player names to scores (if Issue #6 done)

---

## Definition of Done

✅ Scores tracked across games
✅ Persisted in localStorage
✅ Displayed prominently
✅ Reset functionality works

**Time:** 3-4 hours