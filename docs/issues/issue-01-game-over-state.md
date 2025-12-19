# Issue #1: Fix Game Over State

**Priority:** P0 (Blocking gameplay loop)  
**Estimated Effort:** 1-2 hours  
**Phase:** 1 - Playable Core  
**Dependencies:** None  
**Status:** NOT STARTED

---

## Problem Statement

Currently, when a game ends:
- Both players see identical "Game Over! Winner" message regardless of outcome
- No way to start a new game without browser refresh
- No way to return to lobby/home screen
- Game state doesn't reset properly between matches

This breaks the core gameplay loop and makes the game unplayable after the first match.

---

## Acceptance Criteria

**Must Have:**
- [ ] Winner sees distinct "Victory!" message with celebratory styling
- [ ] Loser sees distinct "Defeat!" message with different styling
- [ ] Both players see a "Play Again" button that resets game state
- [ ] "Return to Home" button navigates back to initial screen/lobby
- [ ] Game state properly resets between matches:
  - [ ] Ships cleared from both boards
  - [ ] Hit/miss markers cleared
  - [ ] Turn order reset (or randomized)
  - [ ] Placement phase re-entered correctly
- [ ] Server-side state resets (not just client-side)
- [ ] Both players sync to same state after restart

**Testing Checklist:**
- [ ] Play full game → Player 1 wins → sees "Victory" → Player 2 sees "Defeat"
- [ ] Click "Play Again" → both players return to ship placement
- [ ] Place ships → play second game → correct winner/loser messages again
- [ ] Click "Return to Home" → both navigate to lobby/initial screen
- [ ] Refresh browser mid-game-over → still shows correct message
- [ ] Network latency simulation: delayed restart acknowledgment doesn't break sync

---

## Current State Analysis

**Files Likely Involved:**
- `client/src/components/GameOver.tsx` (or similar game-over component)
- Game state management (server and client)
- Navigation/routing logic
- Server-side game reset endpoint or handler

**What to Investigate First:**
1. Where is the game-over condition detected? (Server-side win detection)
2. How is game-over state communicated to clients? (WebSocket event? API call?)
3. Where is the "Game Over! Winner" message displayed? (Find this component)
4. How is game state stored? (Server object, database, in-memory?)
5. What happens on page refresh? (State persisted or lost?)

---

## Implementation Approach

### Step 1: Identify Winner/Loser on Client

**Goal:** Each client should know if they won or lost

**Tasks:**
- [ ] Locate where game-over event is received from server
- [ ] Check if server includes winner information (player ID, socket ID, etc.)
- [ ] If not included: modify server to send `{ gameOver: true, winnerId: 'player1' }` or similar
- [ ] Client compares `winnerId` with own player ID to determine win/loss

**Validation:**
- Console log on both clients: "I am player1, winner is player1 → I WIN"
- Console log on both clients: "I am player2, winner is player1 → I LOSE"

---

### Step 2: Differentiate Game-Over UI

**Goal:** Show different messages/styling for winner vs loser

**Tasks:**
- [ ] Locate GameOver component (likely `GameOver.tsx` or in main game component)
- [ ] Replace hardcoded "Winner" message with conditional rendering:
  ```tsx
  {isWinner ? (
    <h1 className="victory">Victory!</h1>
  ) : (
    <h1 className="defeat">Defeat!</h1>
  )}
  ```
- [ ] Add CSS classes for `.victory` and `.defeat`:
  - Victory: Green background, celebratory icon, upbeat tone
  - Defeat: Red/gray background, neutral icon, respectful tone
- [ ] Test: Winner sees green "Victory!", loser sees red "Defeat!"

**Optional Polish:**
- Add player name to message: "Wayne Wins!" / "Better luck next time, Wayne!"
- Add stats: "You sank 3 ships! Opponent sank 5."

---

### Step 3: Implement "Play Again" Functionality

**Goal:** Both players can restart the game without browser refresh

**Tasks:**
- [ ] Add "Play Again" button to GameOver component
- [ ] On click, send restart request to server (e.g., `socket.emit('restart-game', { roomId })`)
- [ ] Server handles restart:
  - [ ] Clear all game state (boards, ships, turn order, hit history)
  - [ ] Reset both players to "placement" phase
  - [ ] Broadcast `{ event: 'game-reset' }` to all clients
- [ ] Clients receive reset event:
  - [ ] Clear local game state
  - [ ] Navigate to ship placement screen
  - [ ] Reset UI (clear grids, reset turn indicator)
- [ ] Test: Click "Play Again" → both players return to placement → play second game successfully

**Edge Cases to Handle:**
- What if only one player clicks "Play Again"? (Wait for both? Or one-click restart?)
  - **Recommendation:** One player initiates, both are reset (simpler UX)
- What if restart happens during active game? (Should be disabled until game over)
- Server-side validation: Only allow restart from game-over state

---

### Step 4: Implement "Return to Home" Functionality

**Goal:** Navigate back to lobby/initial screen

**Tasks:**
- [ ] Add "Return to Home" button to GameOver component
- [ ] On click, navigate to home route (e.g., `navigate('/')` in React Router)
- [ ] Server cleans up room/session (if applicable):
  - [ ] Remove player from game room
  - [ ] Mark game as abandoned/complete
  - [ ] Clean up WebSocket connections if needed
- [ ] Test: Click "Return to Home" → both players see lobby/matchmaking screen

**Considerations:**
- Does "home" mean disconnect from opponent? (Probably yes)
- Should home screen show "Rematch with [PlayerName]?" option? (Out of scope for v1)
- Server-side: Ensure no orphaned game sessions

---

### Step 5: Verify State Reset (Most Critical)

**Goal:** Ensure clean slate between games

**Tasks:**
- [ ] Test full reset cycle: Game 1 → Game Over → Play Again → Game 2
- [ ] Verify on both clients:
  - [ ] Ship placements from Game 1 are gone
  - [ ] Hit/miss markers from Game 1 are gone
  - [ ] Turn order is correct (or randomized)
  - [ ] No console errors during transition
- [ ] Test server state:
  - [ ] Inspect server logs: confirm state cleared
  - [ ] Check for memory leaks: old game data not lingering
  - [ ] Verify both clients synced to same initial state

**Red Flags to Watch For:**
- Ships from Game 1 still visible in Game 2 (client-side state not cleared)
- Turn order stuck (server didn't reset turn counter)
- Hits/misses persist across games (hit history not cleared)
- Desynchronization: Player 1 in placement, Player 2 still in game-over

---

## Code Examples / Pseudocode

### Client-Side: Differentiate Winner/Loser

```tsx
// In GameOver.tsx or similar component
interface GameOverProps {
  winnerId: string;
  currentPlayerId: string;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ 
  winnerId, 
  currentPlayerId, 
  onPlayAgain, 
  onReturnHome 
}) => {
  const isWinner = winnerId === currentPlayerId;

  return (
    <div className={`game-over ${isWinner ? 'victory' : 'defeat'}`}>
      <h1>{isWinner ? '🎉 Victory!' : '💀 Defeat!'}</h1>
      <p>
        {isWinner 
          ? 'You sank all enemy ships!' 
          : 'Your fleet was destroyed!'}
      </p>
      
      <div className="game-over-actions">
        <button onClick={onPlayAgain} className="btn-primary">
          Play Again
        </button>
        <button onClick={onReturnHome} className="btn-secondary">
          Return to Home
        </button>
      </div>
    </div>
  );
};
```

### Server-Side: Reset Game State

```typescript
// In game state manager or WebSocket handler
function handleRestartGame(socket, roomId) {
  const room = gameRooms.get(roomId);
  
  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }
  
  // Validate: only allow restart from game-over state
  if (room.state !== 'GAME_OVER') {
    socket.emit('error', { message: 'Can only restart from game over' });
    return;
  }
  
  // Clear all game state
  room.state = 'PLACEMENT';
  room.player1Ships = [];
  room.player2Ships = [];
  room.player1Hits = [];
  room.player2Hits = [];
  room.player1Misses = [];
  room.player2Misses = [];
  room.currentTurn = Math.random() > 0.5 ? 'player1' : 'player2'; // Randomize
  room.winner = null;
  
  // Broadcast reset to all clients in room
  io.to(roomId).emit('game-reset', {
    message: 'Game has been reset',
    startingPlayer: room.currentTurn
  });
  
  console.log(`Game in room ${roomId} reset by ${socket.id}`);
}
```

### Client-Side: Handle Reset Event

```typescript
// In game state context or WebSocket handler
socket.on('game-reset', (data) => {
  console.log('Game reset received:', data);
  
  // Clear local state
  setShips([]);
  setHits([]);
  setMisses([]);
  setCurrentTurn(data.startingPlayer);
  setGameState('PLACEMENT');
  setWinner(null);
  
  // Navigate to placement screen
  navigate('/placement');
  
  // Show toast notification
  toast.info(`New game! ${data.startingPlayer === playerId ? 'You' : 'Opponent'} goes first.`);
});
```

---

## Testing Script

### Manual Test: Full Game Loop with Restart

1. **Setup:** Open two browser windows (Player 1 and Player 2)
2. **Game 1:**
   - [ ] Both players place ships
   - [ ] Play game to completion (one player wins)
   - [ ] Winner sees "Victory!" message (green background)
   - [ ] Loser sees "Defeat!" message (red background)
   - [ ] Both see "Play Again" and "Return to Home" buttons
3. **Restart:**
   - [ ] Player 1 clicks "Play Again"
   - [ ] Both players navigate to ship placement screen
   - [ ] Previous ships/hits are gone (clean slate)
4. **Game 2:**
   - [ ] Both players place ships (can use different layouts)
   - [ ] Play game to completion (potentially different winner)
   - [ ] Correct winner/loser messages appear again
5. **Return Home:**
   - [ ] Player 2 clicks "Return to Home"
   - [ ] Both players navigate to lobby/home screen
   - [ ] Can start new game from scratch

### Edge Case Tests

- [ ] **Mid-game refresh:** Refresh browser during active game → reconnect → play to game over → correct messages
- [ ] **Double-click Play Again:** Click button rapidly → doesn't break state or create duplicate games
- [ ] **Network delay:** Simulate slow connection (browser DevTools throttling) → restart still syncs correctly
- [ ] **One player leaves:** Player 1 closes browser at game over → Player 2 sees "Opponent disconnected" (not in scope for Issue #1, but note if it breaks)

---

## Definition of Done

✅ **Functionality:**
- Winner and loser see different game-over messages
- "Play Again" button resets game state and returns to placement
- "Return to Home" button navigates to lobby/home
- Second game plays correctly after restart (no state leakage)

✅ **Code Quality:**
- No console errors during game-over → restart → second game
- Server logs confirm state reset
- Code is readable (comments on non-obvious logic)

✅ **Testing:**
- Manual test script completed successfully
- Edge cases tested (refresh, double-click, network delay)
- Works on both desktop and mobile browsers

✅ **Documentation:**
- Progress Tracker updated (Issue #1 marked complete)
- Decision Log updated with any implementation choices made
- Known issues/limitations documented (if any)

---

## Potential Blockers

**If you encounter these, document and escalate:**

1. **Server state management unclear:** Can't find where game state is stored
   - *Action:* Document current understanding, ask Wayne to clarify architecture
   
2. **WebSocket event structure unknown:** Don't know how server communicates with clients
   - *Action:* Capture existing WebSocket events (console.log all incoming events), document, ask Wayne
   
3. **Routing/navigation not set up:** No way to navigate between screens
   - *Action:* Check if React Router (or similar) is installed; if not, flag as dependency
   
4. **Client/server desync issues:** Players see different states after restart
   - *Action:* Add extensive logging (client and server), capture sequence of events, share with Wayne

---

## Success Metrics

**This issue is successful if:**
- [ ] Wayne can play two full games in a row without browser refresh
- [ ] Winner/loser are correctly identified every time
- [ ] No bugs or state leakage between games
- [ ] Code is understandable by next AI or human developer

**Time to completion:** Target 1-2 hours; escalate if exceeds 3 hours without progress

---

## Next Steps After Completion

1. Update `PROJECT.md` Progress Tracker (mark Issue #1 complete)
2. Commit changes with clear message: `Issue #1: Fix game-over state with winner/loser differentiation and restart functionality`
3. Push to GitHub
4. Update GitHub Issue #1 with link to commit
5. Test deployed version (if applicable)
6. Begin Issue #2 (Ship Rotation) or Issue #4 (Layout) based on Wayne's direction