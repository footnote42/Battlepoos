# Issue #3: Add Restart Button (In-Game)

**Priority:** P1 (Quality of life improvement)
**Estimated Effort:** 1 hour
**Phase:** 1 - Playable Core
**Dependencies:** Issue #1 (Game Over State) - reuses restart logic
**Status:** COMPLETE (2025-12-19)

---

## Problem Statement

Currently, there's no way to abandon or restart an active game. If players:
- Make a mistake during ship placement
- Want to start over mid-game
- Encounter a bug or get stuck
- Simply change their mind

...they must refresh the browser, which:
- Breaks the WebSocket connection
- May cause server-side errors or orphaned game states
- Forces reconnection and potential resync issues
- Creates poor user experience

Adding an in-game restart button provides graceful exit from any game state.

---

## Acceptance Criteria

**Must Have:**
- [ ] "Restart" or "New Game" button accessible during active gameplay
- [ ] Button visible in multiple game phases:
  - [ ] During ship placement
  - [ ] During active gameplay (taking turns)
  - [ ] At game over screen (may use "Play Again" button from Issue #1)
- [ ] Clicking button prompts confirmation dialog:
  - [ ] "Are you sure? This will end the current game."
  - [ ] "Confirm" and "Cancel" options
- [ ] On confirmation:
  - [ ] Opponent is notified ("Opponent has restarted the game")
  - [ ] Both players return to ship placement phase (or lobby, TBD)
  - [ ] Game state fully resets (reuses logic from Issue #1)
- [ ] No orphaned game states on server
- [ ] Works correctly from any game phase

**User Experience:**
- [ ] Button is clearly labeled ("Restart" or "New Game")
- [ ] Button placement doesn't interfere with gameplay (top-right corner or menu?)
- [ ] Confirmation dialog prevents accidental clicks
- [ ] Opponent receives clear notification (not just silently reset)
- [ ] Restart doesn't count as win/loss in scoring (if Issue #7 implemented)

**Testing Checklist:**
- [ ] Restart from ship placement phase → both players return to placement, ships cleared
- [ ] Restart mid-game (5 turns in) → both players return to placement, game state reset
- [ ] Restart at game-over screen → same as "Play Again" button (Issue #1)
- [ ] Click restart → cancel confirmation → game continues uninterrupted
- [ ] Rapid clicking restart button → doesn't create multiple restart events
- [ ] Player 1 restarts → Player 2 sees notification and resets too

---

## Current State Analysis

**Files Likely Involved:**
- Game UI component (header, menu, or persistent controls)
- Confirmation dialog component (may need to create)
- Game state management (client and server)
- WebSocket event handlers (for notifying opponent)
- Reset logic from Issue #1 (reuse where possible)

**What to Investigate First:**
1. Where should the restart button be placed in UI? (Always visible vs. in menu?)
2. Is there existing confirmation dialog component? (Or need to build one?)
3. How does restart differ from "Play Again" (Issue #1)? (Restart mid-game vs. after game over)
4. Should restart forfeit the game for the player who clicks it? (Or mutual reset?)
5. How to notify opponent? (WebSocket event? In-game notification banner?)

**Key Questions:**
- Do both players need to agree to restart? (Recommendation: No, one player initiates)
- Should restart end current game and start new one? Or return to lobby?
- How to handle disconnect during restart? (Edge case, may defer to future)

---

## Implementation Approach

### Step 1: Add Restart Button to UI

**Goal:** Button is always accessible during active game

**Recommended Placement:**
```tsx
// Option A: Persistent header
<header className="game-header">
  <h1>Battlepoos</h1>
  <button 
    onClick={handleRestartClick}
    className="btn-restart"
    aria-label="Restart game"
  >
    🔄 Restart
  </button>
</header>

// Option B: Menu dropdown (if other options exist)
<Menu>
  <MenuItem onClick={handleRestartClick}>🔄 Restart Game</MenuItem>
  <MenuItem onClick={handleMute}>🔇 Mute</MenuItem>
  {/* Other options */}
</Menu>
```

**Tasks:**
- [ ] Decide on button placement (header recommended for v1)
- [ ] Add restart button to game UI (persistent across game phases)
- [ ] Style button appropriately (not too prominent, but discoverable)
- [ ] Test: Button visible during placement, gameplay, and game-over phases
- [ ] Test: Button doesn't obstruct game grid or important UI elements

**Note:** At game-over phase, this button may be redundant with "Play Again" from Issue #1. Consider hiding it or labeling differently ("Play Again" vs "Restart").

---

### Step 2: Create Confirmation Dialog

**Goal:** Prevent accidental restarts

**Dialog Component:**
```tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Usage:**
```tsx
const [showRestartDialog, setShowRestartDialog] = useState(false);

const handleRestartClick = () => {
  setShowRestartDialog(true);
};

const handleConfirmRestart = () => {
  setShowRestartDialog(false);
  initiateRestart();
};

const handleCancelRestart = () => {
  setShowRestartDialog(false);
  // Game continues normally
};

// In JSX
<ConfirmDialog
  isOpen={showRestartDialog}
  title="Restart Game?"
  message="This will end the current game and return to ship placement. Are you sure?"
  onConfirm={handleConfirmRestart}
  onCancel={handleCancelRestart}
/>
```

**Tasks:**
- [ ] Create or locate confirmation dialog component
- [ ] Wire up to restart button click
- [ ] Test: Click restart → dialog appears with correct message
- [ ] Test: Click "Cancel" → dialog closes, game continues
- [ ] Test: Click "Confirm" → restart initiated (next step)
- [ ] Test: Press Escape key → dialog closes (accessibility)

---

### Step 3: Implement Restart Logic (Client-Side)

**Goal:** Send restart request to server, handle response

**Client-Side Flow:**
```typescript
const initiateRestart = () => {
  // Send restart request to server
  socket.emit('restart-game', {
    roomId: currentRoomId,
    playerId: currentPlayerId
  });
  
  // Show loading state while waiting for server response
  setGameState('RESTARTING');
  
  // Optionally: Show notification to opponent
  // (Server will handle broadcasting, but UI can show "Restarting...")
};

// Listen for restart confirmation from server
socket.on('game-restarted', (data) => {
  console.log('Game restarted:', data);
  
  // Reset local game state
  resetLocalGameState();
  
  // Navigate to ship placement (or lobby)
  navigate('/placement');
  
  // Show notification
  toast.info('Game has been restarted. Place your ships!');
});

// Listen for opponent-initiated restart
socket.on('opponent-restarted', () => {
  toast.warning('Opponent has restarted the game.');
  
  // Reset local game state
  resetLocalGameState();
  
  // Navigate to ship placement
  navigate('/placement');
});

function resetLocalGameState() {
  // Clear ships
  setMyShips([]);
  setOpponentShips([]);
  
  // Clear hits/misses
  setMyHits([]);
  setMyMisses([]);
  setOpponentHits([]);
  setOpponentMisses([]);
  
  // Reset turn
  setCurrentTurn(null);
  setGamePhase('PLACEMENT');
  
  // Clear winner
  setWinner(null);
}
```

**Tasks:**
- [ ] Implement `initiateRestart()` function
- [ ] Send `restart-game` event to server with room/player info
- [ ] Handle `game-restarted` response from server
- [ ] Handle `opponent-restarted` event (opponent initiated restart)
- [ ] Call `resetLocalGameState()` to clear all game data
- [ ] Navigate to appropriate screen (placement or lobby)
- [ ] Show user-friendly notifications throughout process

---

### Step 4: Implement Restart Logic (Server-Side)

**Goal:** Handle restart request, reset game state, notify both players

**Server-Side Handler:**
```typescript
socket.on('restart-game', ({ roomId, playerId }) => {
  const room = gameRooms.get(roomId);
  
  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }
  
  // Validate that player is in this room
  if (!room.players.includes(playerId)) {
    socket.emit('error', { message: 'Not authorized to restart this game' });
    return;
  }
  
  // Log restart action
  console.log(`Player ${playerId} initiated restart in room ${roomId}`);
  
  // Reset game state (reuse logic from Issue #1 if available)
  resetGameState(room);
  
  // Notify both players
  io.to(roomId).emit('game-restarted', {
    message: 'Game has been restarted',
    initiatedBy: playerId
  });
  
  // Optional: Notify specifically to opponent
  const opponentSocket = getOpponentSocket(roomId, playerId);
  if (opponentSocket) {
    opponentSocket.emit('opponent-restarted');
  }
});

function resetGameState(room: GameRoom) {
  room.state = 'PLACEMENT';
  room.player1Ships = [];
  room.player2Ships = [];
  room.player1Hits = [];
  room.player2Hits = [];
  room.player1Misses = [];
  room.player2Misses = [];
  room.currentTurn = null;
  room.winner = null;
  
  // Clear any timers or pending actions
  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }
}
```

**Tasks:**
- [ ] Implement `restart-game` WebSocket handler
- [ ] Validate player authorization (player is in room)
- [ ] Call `resetGameState()` to clear server-side state
  - [ ] Reuse logic from Issue #1 where possible
- [ ] Broadcast `game-restarted` event to both players
- [ ] Send `opponent-restarted` to opponent specifically
- [ ] Test: Restart initiated → server resets state correctly
- [ ] Test: Both clients receive restart events

---

### Step 5: Handle Edge Cases

**Goal:** Restart works reliably in all scenarios

**Edge Cases to Handle:**

1. **Restart During Placement:**
   - Both players in placement phase → reset works normally
   - One player ready, other still placing → both return to start of placement

2. **Restart Mid-Game:**
   - Game in progress → current turn is lost, no partial turns
   - Ensure hit/miss history is cleared on both client and server

3. **Restart at Game Over:**
   - Functionally same as "Play Again" (Issue #1)
   - May want to hide "Restart" button when "Play Again" is visible

4. **Rapid Clicking:**
   - Disable restart button after first click (until confirmation)
   - Server should ignore duplicate restart events

5. **One Player Disconnects During Restart:**
   - Remaining player should still be able to restart
   - When disconnected player reconnects, sync to restarted state

**Implementation:**
```tsx
// Prevent rapid clicking
const [isRestarting, setIsRestarting] = useState(false);

const initiateRestart = () => {
  if (isRestarting) return; // Debounce
  
  setIsRestarting(true);
  socket.emit('restart-game', { roomId, playerId });
  
  // Re-enable after timeout (safety fallback)
  setTimeout(() => setIsRestarting(false), 3000);
};

// On successful restart, clear flag
socket.on('game-restarted', () => {
  setIsRestarting(false);
  // ... rest of restart logic
});
```

**Tasks:**
- [ ] Test restart from each game phase (placement, gameplay, game-over)
- [ ] Implement debounce/disable on restart button
- [ ] Verify server ignores duplicate restart events (idempotency)
- [ ] Test disconnect during restart (optional: defer if complex)
- [ ] Hide restart button at game-over if "Play Again" button is present (UI polish)

---

## Code Examples / Pseudocode

### Full Client-Side Implementation

```tsx
// In main game component
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import ConfirmDialog from './components/ConfirmDialog';

function GameScreen() {
  const navigate = useNavigate();
  const socket = useSocket();
  
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  
  // Restart button click handler
  const handleRestartClick = () => {
    setShowRestartDialog(true);
  };
  
  // User confirms restart
  const handleConfirmRestart = () => {
    setShowRestartDialog(false);
    initiateRestart();
  };
  
  // User cancels restart
  const handleCancelRestart = () => {
    setShowRestartDialog(false);
  };
  
  // Send restart request to server
  const initiateRestart = () => {
    if (isRestarting) return; // Prevent double-click
    
    setIsRestarting(true);
    socket.emit('restart-game', {
      roomId: currentRoomId,
      playerId: currentPlayerId
    });
  };
  
  // Listen for restart events
  useEffect(() => {
    socket.on('game-restarted', (data) => {
      console.log('Game restarted by:', data.initiatedBy);
      
      resetLocalGameState();
      setIsRestarting(false);
      navigate('/placement');
      toast.info('Game restarted! Place your ships.');
    });
    
    socket.on('opponent-restarted', () => {
      toast.warning('Opponent has restarted the game.');
      resetLocalGameState();
      navigate('/placement');
    });
    
    return () => {
      socket.off('game-restarted');
      socket.off('opponent-restarted');
    };
  }, [socket, navigate]);
  
  return (
    <div className="game-screen">
      <header className="game-header">
        <h1>Battlepoos</h1>
        <button 
          onClick={handleRestartClick}
          disabled={isRestarting}
          className="btn-restart"
        >
          {isRestarting ? 'Restarting...' : '🔄 Restart'}
        </button>
      </header>
      
      {/* Game board and other UI */}
      
      <ConfirmDialog
        isOpen={showRestartDialog}
        title="Restart Game?"
        message="This will end the current game and return to ship placement. Your opponent will be notified."
        onConfirm={handleConfirmRestart}
        onCancel={handleCancelRestart}
      />
    </div>
  );
}
```

---

## Testing Script

### Manual Test: Restart Button Functionality

**Test 1: Restart During Placement**
1. [ ] Open two browser windows (Player 1 and Player 2)
2. [ ] Both enter ship placement phase
3. [ ] Player 1 places 2 ships
4. [ ] Player 1 clicks "Restart" button
5. [ ] Confirmation dialog appears
6. [ ] Player 1 clicks "Confirm"
7. [ ] Both players return to start of placement (ships cleared)
8. [ ] Player 2 sees notification: "Opponent has restarted the game"
9. [ ] Both can place ships again normally

**Test 2: Restart Mid-Game**
1. [ ] Both players complete placement phase
2. [ ] Play 5 turns (hits and misses recorded)
3. [ ] Player 2 clicks "Restart"
4. [ ] Confirmation appears, Player 2 confirms
5. [ ] Both players return to placement phase
6. [ ] All previous ships, hits, misses are cleared
7. [ ] Turn order resets (or randomizes, per Issue #1)
8. [ ] Game can be played again from scratch

**Test 3: Restart at Game Over**
1. [ ] Play full game to completion
2. [ ] Game over screen appears (winner/loser messages)
3. [ ] "Restart" button still visible (or "Play Again" used instead)
4. [ ] Click restart → both players return to placement
5. [ ] Functionally same as "Play Again" from Issue #1

**Test 4: Cancel Restart**
1. [ ] Mid-game, click "Restart" button
2. [ ] Confirmation dialog appears
3. [ ] Click "Cancel"
4. [ ] Dialog closes
5. [ ] Game continues exactly as before (no state change)
6. [ ] Can still take turns normally

**Test 5: Rapid Clicking**
1. [ ] Click "Restart" button repeatedly (5 times fast)
2. [ ] Only one confirmation dialog appears (no duplicates)
3. [ ] Confirm restart
4. [ ] Only one restart event processed (no multiple resets)
5. [ ] Game state consistent on both clients

**Test 6: Opponent Notification**
1. [ ] Player 1 restarts game
2. [ ] Player 2's screen shows clear notification:
   - Toast/banner: "Opponent has restarted the game"
   - Automatically navigates to placement screen
   - No manual action required from Player 2
3. [ ] Both players synced to same state (placement phase)

---

## Definition of Done

✅ **Functionality:**
- Restart button accessible during all game phases
- Clicking prompts confirmation dialog (prevents accidents)
- Confirming restart resets game state on client and server
- Opponent is notified of restart and synced to new state
- Works from placement, gameplay, and game-over phases

✅ **User Experience:**
- Button placement is intuitive and non-intrusive
- Confirmation message is clear and actionable
- Opponent receives clear notification (not silently reset)
- No lag or confusion during restart process

✅ **Code Quality:**
- Restart logic reuses code from Issue #1 where possible
- No duplicate restart events processed (idempotent)
- Clean event handler cleanup (no memory leaks)
- Code is readable with clear function names

✅ **Testing:**
- Manual test script completed successfully
- Edge cases tested (rapid clicking, cancel, mid-placement restart)
- Tested on both client windows simultaneously
- No orphaned game states on server

✅ **Documentation:**
- Progress Tracker updated (Issue #3 marked complete)
- Decision Log updated (e.g., "decided one player can initiate restart")
- Any known limitations documented

---

## Potential Blockers

**If you encounter these, document and escalate:**

1. **Issue #1 (Game Over State) not complete:** Need reset logic from that issue
   - *Action:* Complete Issue #1 first, or implement temporary reset logic and refactor later

2. **No confirmation dialog component exists:** Need to build from scratch
   - *Action:* Build simple modal/dialog component; estimate 30-45 min; confirm acceptable

3. **Server doesn't have reset function:** All game state reset logic is manual/ad-hoc
   - *Action:* Extract reset logic into reusable function; ensure it's called from both "Play Again" and "Restart"

4. **Unclear restart semantics:** Should restart forfeit current game? Count as loss?
   - *Action:* Document question; propose: "Restart is neutral, doesn't affect win/loss (if tracking)"; confirm with Wayne

5. **Opponent disconnect during restart:** Complex edge case, unclear how to handle
   - *Action:* Defer to future; document as known limitation: "If opponent disconnects during restart, may require refresh"

---

## Success Metrics

**This issue is successful if:**
- [ ] Wayne can restart a game at any point (placement, gameplay, game-over)
- [ ] Restart requires confirmation (no accidental clicks)
- [ ] Both players sync to restarted state without manual refresh
- [ ] No bugs or orphaned states after restart
- [ ] Opponent clearly notified of restart action

**Time to completion:** Target 1 hour; escalate if exceeds 2 hours without progress

---

## Next Steps After Completion

1. Update `PROJECT.md` Progress Tracker (mark Issue #3 complete)
2. Commit: `Issue #3: Add in-game restart button with confirmation dialog and opponent notification`
3. Push to GitHub, update GitHub Issue #3
4. **Phase 1 Complete!** All three P0 issues done (Game Over, Ship Rotation, Restart)
5. Validate Phase 1 exit criteria:
   - [ ] Full game loop works (placement → play → game over → restart)
   - [ ] Winner/loser see correct messages
   - [ ] Ships can be rotated during placement
   - [ ] Game can be restarted without browser refresh
6. If all exit criteria met, proceed to Phase 2 (Visual Polish)