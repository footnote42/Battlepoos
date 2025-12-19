# Issue #2: Implement Ship Rotation During Placement

**Priority:** P0 (Core gameplay mechanic missing)  
**Estimated Effort:** 2-4 hours  
**Phase:** 1 - Playable Core  
**Dependencies:** Issue #1 (Game Over State) should be complete for clean testing  
**Status:** NOT STARTED

---

## Problem Statement

Currently, players cannot rotate ships during the placement phase. Ships can only be placed in one orientation (likely horizontal or vertical), which:
- Limits strategic placement options
- Creates frustrating user experience
- Doesn't match standard Battleship game expectations
- May make certain board configurations impossible

This is a core gameplay mechanic that must work before the game is truly playable.

---

## Acceptance Criteria

**Must Have:**
- [ ] Rotation control is clearly visible during ship placement phase
- [ ] Ships rotate 90 degrees on interaction (horizontal ↔ vertical)
- [ ] Visual feedback shows ship orientation BEFORE placement is confirmed
- [ ] Placement validation prevents rotated ships from overflowing grid boundaries
- [ ] Works on both mobile touch and desktop click
- [ ] Clear visual indicator of current ship orientation (horizontal vs vertical)
- [ ] Rotation state persists while dragging/positioning ship
- [ ] After placement is confirmed, ship locks in current orientation

**User Experience:**
- [ ] Mobile: Tap ship or dedicated rotate button to change orientation
- [ ] Desktop: Click rotate button OR use keyboard (R key, spacebar, or arrow keys)
- [ ] Visual: Ship preview shows which cells will be occupied in current orientation
- [ ] Feedback: Invalid placements (out of bounds) clearly indicated (red outline, error message)

**Testing Checklist:**
- [ ] Place all 5 ships in various rotations (mix of horizontal and vertical)
- [ ] Attempt to place rotated ship that would overflow grid → placement rejected
- [ ] Rotate ship multiple times before placing → correct orientation saved
- [ ] Place ship horizontally at top-left → rotates → place vertically at bottom-right
- [ ] Mobile touch: Tap to rotate works smoothly, no accidental placements
- [ ] Desktop: Keyboard shortcuts work (if implemented)
- [ ] Server receives correct ship coordinates for both orientations

---

## Current State Analysis

**Files Likely Involved:**
- `client/src/components/ShipPlacement.tsx` (or similar placement component)
- Ship data model/type definitions
- Placement validation logic (client and server-side)
- Grid rendering component

**What to Investigate First:**
1. How are ships currently represented? (Data structure: array of coordinates? start position + length + orientation?)
2. Where is the placement UI rendered? (Drag-and-drop? Click to place?)
3. Is there existing validation for ship bounds? (Where and how?)
4. How are ship coordinates sent to server? (Format must support orientation)
5. Does server validate ship placements? (If yes, must update to handle rotation)

**Key Questions:**
- Are ships currently hard-coded to one orientation?
- Is there a ship "preview" before placement is confirmed?
- How is the grid implemented? (Canvas? HTML table? CSS Grid?)

---

## Implementation Approach

### Step 1: Update Ship Data Model

**Goal:** Ships must store orientation alongside position

**Current Structure (likely):**
```typescript
// Before
interface Ship {
  id: string;
  length: number;
  coordinates: { x: number, y: number }[]; // e.g., [{x:0,y:0}, {x:1,y:0}, {x:2,y:0}]
}
```

**Updated Structure (needed):**
```typescript
// After
interface Ship {
  id: string;
  name: string;        // e.g., "Carrier", "Battleship"
  length: number;      // e.g., 5, 4, 3
  startPos: { x: number, y: number };  // Top-left cell
  orientation: 'horizontal' | 'vertical';
}

// Helper function to get coordinates from ship data
function getShipCoordinates(ship: Ship): { x: number, y: number }[] {
  const coords = [];
  for (let i = 0; i < ship.length; i++) {
    if (ship.orientation === 'horizontal') {
      coords.push({ x: ship.startPos.x + i, y: ship.startPos.y });
    } else {
      coords.push({ x: ship.startPos.x, y: ship.startPos.y + i });
    }
  }
  return coords;
}
```

**Tasks:**
- [ ] Locate ship type definition (likely in `types/` or `models/`)
- [ ] Add `orientation` field (default to 'horizontal')
- [ ] Update any code that reads ship coordinates to handle both orientations
- [ ] Test: Create ship with horizontal orientation → verify coordinates correct
- [ ] Test: Change to vertical orientation → verify coordinates recalculate correctly

---

### Step 2: Add Rotation Control to UI

**Goal:** User can change ship orientation before placing

**Option A: Dedicated Rotate Button (Recommended for v1)**
```tsx
<div className="ship-placement-controls">
  <div className="ship-preview">
    <Ship orientation={currentOrientation} length={currentShip.length} />
  </div>
  <button 
    onClick={handleRotate}
    className="btn-rotate"
    aria-label="Rotate ship"
  >
    🔄 Rotate
  </button>
  <p>Current: {currentOrientation === 'horizontal' ? 'Horizontal →' : 'Vertical ↓'}</p>
</div>
```

**Option B: Tap Ship to Rotate (Mobile-friendly)**
```tsx
<div 
  className="ship-preview clickable"
  onClick={handleRotate}
  role="button"
  aria-label="Tap to rotate ship"
>
  <Ship orientation={currentOrientation} length={currentShip.length} />
</div>
```

**Option C: Keyboard Shortcuts (Desktop enhancement)**
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
      handleRotate();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [currentOrientation]);
```

**Tasks:**
- [ ] Add rotation button/control to placement UI
- [ ] Implement `handleRotate()` function:
  ```typescript
  const handleRotate = () => {
    setCurrentOrientation(prev => 
      prev === 'horizontal' ? 'vertical' : 'horizontal'
    );
  };
  ```
- [ ] Visual feedback: Ship preview updates immediately when rotated
- [ ] Test: Click rotate → ship preview changes orientation
- [ ] Test: Rotate multiple times → cycles correctly

**Recommendation:** Start with Option A (button), add Option B (tap) if time permits, skip Option C (keyboard) for v1.

---

### Step 3: Update Placement Validation

**Goal:** Prevent rotated ships from going out of bounds

**Validation Logic:**
```typescript
function isValidPlacement(
  ship: Ship, 
  gridSize: number = 10
): { valid: boolean, reason?: string } {
  const coords = getShipCoordinates(ship);
  
  // Check all coordinates are within grid
  for (const coord of coords) {
    if (coord.x < 0 || coord.x >= gridSize || 
        coord.y < 0 || coord.y >= gridSize) {
      return { 
        valid: false, 
        reason: 'Ship goes out of bounds' 
      };
    }
  }
  
  // Check for overlap with existing ships (if applicable)
  // ... existing overlap logic ...
  
  return { valid: true };
}
```

**Specific Edge Cases:**
- Horizontal ship at right edge: `startPos.x + length > gridSize` → invalid
- Vertical ship at bottom edge: `startPos.y + length > gridSize` → invalid
- Ship rotated after positioning: May become invalid if now out of bounds

**Tasks:**
- [ ] Locate existing placement validation (client-side)
- [ ] Update to check bounds for both orientations
- [ ] Add validation check BEFORE allowing placement confirmation
- [ ] Visual feedback for invalid placement:
  - Red outline on ship preview
  - Error message: "Ship doesn't fit here when rotated"
  - Disable "Confirm Placement" button
- [ ] Test: Try to place 5-cell horizontal ship at x=6 → should fail (6+5=11 > 10)
- [ ] Test: Rotate to vertical at same position → should succeed (if y allows it)

---

### Step 4: Update Server-Side Validation

**Goal:** Server must accept and validate rotated ships

**Server Validation (must match client logic):**
```typescript
// Server-side placement handler
function validateShipPlacement(ship: Ship, existingShips: Ship[]): boolean {
  const GRID_SIZE = 10;
  const coords = getShipCoordinates(ship);
  
  // Bounds check
  for (const coord of coords) {
    if (coord.x < 0 || coord.x >= GRID_SIZE || 
        coord.y < 0 || coord.y >= GRID_SIZE) {
      return false;
    }
  }
  
  // Overlap check
  for (const existingShip of existingShips) {
    const existingCoords = getShipCoordinates(existingShip);
    for (const coord of coords) {
      if (existingCoords.some(ec => ec.x === coord.x && ec.y === coord.y)) {
        return false; // Overlap detected
      }
    }
  }
  
  return true;
}
```

**Tasks:**
- [ ] Locate server-side placement handler
- [ ] Ensure ship data includes `orientation` field
- [ ] Update validation to check bounds for both orientations
- [ ] Add error response for invalid placements:
  ```typescript
  socket.emit('placement-error', { 
    message: 'Invalid ship placement',
    reason: 'out_of_bounds' 
  });
  ```
- [ ] Test: Send rotated ship placement from client → server accepts if valid
- [ ] Test: Send invalid rotated placement → server rejects with clear error

---

### Step 5: Visual Feedback and Preview

**Goal:** Player sees exactly where ship will be placed before confirming

**Preview Implementation:**
```tsx
function ShipPreview({ ship, isValid }: { ship: Ship, isValid: boolean }) {
  const coords = getShipCoordinates(ship);
  
  return (
    <>
      {coords.map((coord, idx) => (
        <div
          key={idx}
          className={`grid-cell ship-preview ${isValid ? 'valid' : 'invalid'}`}
          style={{
            gridColumn: coord.x + 1,
            gridRow: coord.y + 1,
            backgroundColor: isValid ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)',
          }}
        />
      ))}
    </>
  );
}
```

**Visual States:**
- **Before placing:** Ship outline follows cursor/touch (if drag-and-drop)
- **Valid placement:** Green semi-transparent overlay
- **Invalid placement:** Red semi-transparent overlay with error icon
- **Confirmed placement:** Solid color, ship locked in place

**Tasks:**
- [ ] Add ship preview overlay to grid
- [ ] Preview updates in real-time as ship is rotated or moved
- [ ] Color code: Green = valid, Red = invalid
- [ ] Optional: Add arrow or icon indicating ship orientation (→ or ↓)
- [ ] Test: Move ship around grid → preview follows accurately
- [ ] Test: Rotate ship → preview orientation updates immediately
- [ ] Test: Invalid position → preview turns red, placement disabled

---

### Step 6: Integration Testing

**Goal:** Rotation works end-to-end (client → server → opponent's view)

**Full Flow Test:**
1. Player 1 enters placement phase
2. Selects first ship (e.g., Carrier, length 5)
3. Rotates ship to vertical
4. Places at position (2, 3)
5. Server receives: `{ startPos: {x:2, y:3}, orientation: 'vertical', length: 5 }`
6. Server validates and stores ship
7. Player 1 sees ship locked in vertical orientation on their board
8. Player 1 continues placing remaining ships (mix of orientations)
9. Game starts → opponent cannot see Player 1's ships (hidden)
10. When opponent fires at Player 1's vertical ship → hit detection works correctly

**Edge Cases:**
- [ ] Rotate ship multiple times rapidly → doesn't glitch or double-rotate
- [ ] Place all ships in same orientation (all horizontal or all vertical) → works
- [ ] Mix orientations (some H, some V) → all placed correctly
- [ ] Attempt invalid placement → rotation still works after error
- [ ] Refresh browser mid-placement → rotation state doesn't persist (expected)

**Tasks:**
- [ ] Complete full placement flow with rotated ships
- [ ] Verify server stores orientation correctly
- [ ] Check opponent's view: ships are hidden (coordinates not leaked)
- [ ] Fire at rotated ship coordinates → hits register correctly
- [ ] Play full game with rotated ships → game over state reached correctly

---

## Code Examples / Pseudocode

### Client-Side: Rotation State Management

```typescript
// In ShipPlacement component or custom hook
const [currentShip, setCurrentShip] = useState<{
  id: string;
  name: string;
  length: number;
  orientation: 'horizontal' | 'vertical';
} | null>(null);

const [placedShips, setPlacedShips] = useState<Ship[]>([]);

const handleRotate = () => {
  if (!currentShip) return;
  
  setCurrentShip(prev => ({
    ...prev!,
    orientation: prev!.orientation === 'horizontal' ? 'vertical' : 'horizontal'
  }));
};

const handlePlaceShip = (startPos: { x: number, y: number }) => {
  if (!currentShip) return;
  
  const shipToPlace: Ship = {
    ...currentShip,
    startPos
  };
  
  // Validate placement
  const validation = isValidPlacement(shipToPlace, placedShips);
  if (!validation.valid) {
    toast.error(validation.reason || 'Invalid placement');
    return;
  }
  
  // Add to placed ships
  setPlacedShips(prev => [...prev, shipToPlace]);
  
  // Send to server
  socket.emit('place-ship', shipToPlace);
  
  // Move to next ship or finish
  if (placedShips.length + 1 === TOTAL_SHIPS) {
    socket.emit('placement-complete');
  } else {
    setCurrentShip(SHIP_TYPES[placedShips.length + 1]);
  }
};
```

### Server-Side: Receiving and Validating Rotated Ships

```typescript
// In WebSocket handler or game state manager
socket.on('place-ship', (shipData: Ship) => {
  const room = getPlayerRoom(socket.id);
  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return;
  }
  
  // Validate ship data structure
  if (!shipData.startPos || !shipData.orientation || !shipData.length) {
    socket.emit('placement-error', { 
      message: 'Invalid ship data',
      reason: 'missing_fields'
    });
    return;
  }
  
  // Validate orientation value
  if (shipData.orientation !== 'horizontal' && shipData.orientation !== 'vertical') {
    socket.emit('placement-error', { 
      message: 'Invalid orientation',
      reason: 'invalid_orientation'
    });
    return;
  }
  
  // Get player's existing ships
  const playerId = getPlayerId(socket.id);
  const existingShips = room[`${playerId}Ships`] || [];
  
  // Validate placement
  if (!validateShipPlacement(shipData, existingShips)) {
    socket.emit('placement-error', { 
      message: 'Invalid ship placement',
      reason: 'out_of_bounds_or_overlap'
    });
    return;
  }
  
  // Store ship
  room[`${playerId}Ships`].push(shipData);
  
  // Confirm to client
  socket.emit('ship-placed', { 
    ship: shipData,
    remaining: TOTAL_SHIPS - room[`${playerId}Ships`].length
  });
  
  console.log(`Player ${playerId} placed ${shipData.orientation} ship at (${shipData.startPos.x}, ${shipData.startPos.y})`);
});
```

---

## Testing Script

### Manual Test: Ship Rotation Functionality

**Setup:** Open browser to ship placement screen

**Test 1: Basic Rotation**
1. [ ] Select first ship (Carrier, length 5)
2. [ ] Click "Rotate" button → ship preview changes from horizontal to vertical
3. [ ] Click "Rotate" again → ship preview changes back to horizontal
4. [ ] Repeat 5 times rapidly → no glitches or errors

**Test 2: Placement with Rotation**
1. [ ] Rotate ship to horizontal
2. [ ] Place at top-left corner (0,0)
3. [ ] Ship occupies cells (0,0), (1,0), (2,0), (3,0), (4,0) → correct
4. [ ] Select next ship
5. [ ] Rotate to vertical
6. [ ] Place at position (7,2)
7. [ ] Ship occupies cells (7,2), (7,3), (7,4) (assuming length 3) → correct

**Test 3: Out-of-Bounds Prevention**
1. [ ] Select Carrier (length 5), keep horizontal
2. [ ] Attempt to place at (6,0) → preview shows red, placement blocked
3. [ ] Rotate to vertical
4. [ ] Try to place at same (6,0) → should be valid (5 cells down from row 0)
5. [ ] Confirm placement works after rotation fixes bounds issue

**Test 4: Mixed Orientations**
1. [ ] Place all 5 ships in alternating orientations:
   - Ship 1: Horizontal at (0,0)
   - Ship 2: Vertical at (0,2)
   - Ship 3: Horizontal at (5,5)
   - Ship 4: Vertical at (8,0)
   - Ship 5: Horizontal at (2,8)
2. [ ] All placements accepted
3. [ ] Click "Ready" or "Confirm Fleet"
4. [ ] Game starts with correct ship placements

**Test 5: Mobile Touch**
1. [ ] Open on mobile device (or DevTools mobile emulation)
2. [ ] Tap rotate button → ship orientation changes
3. [ ] Tap grid cell → ship placed (if valid)
4. [ ] Tap to rotate → tap to place → repeat for all ships
5. [ ] No accidental double-placements or missed taps

**Test 6: Server Synchronization**
1. [ ] Open two browser windows (Player 1 and Player 2)
2. [ ] Player 1 places ships with various rotations
3. [ ] Player 2 places ships with various rotations
4. [ ] Both click "Ready"
5. [ ] Game starts
6. [ ] Player 1 fires at coordinate where Player 2 has vertical ship → registers hit
7. [ ] Verify hit detection works for both orientations

---

## Definition of Done

✅ **Functionality:**
- Users can rotate ships 90 degrees during placement phase
- Rotation control is intuitive (button, tap, or keyboard)
- Placement validation prevents out-of-bounds rotated ships
- Server accepts and validates rotated ship placements
- Hit detection works correctly for both horizontal and vertical ships

✅ **User Experience:**
- Visual preview shows ship orientation before placement
- Invalid placements clearly indicated (red outline, error message)
- Works smoothly on mobile touch and desktop click
- No lag or glitches when rotating rapidly

✅ **Code Quality:**
- Ship data model includes orientation field
- Validation logic is consistent (client and server)
- Code is readable with clear variable names
- No console errors or warnings

✅ **Testing:**
- Manual test script completed successfully
- Edge cases tested (out-of-bounds, mixed orientations, rapid rotation)
- Tested on mobile and desktop
- Server-client synchronization verified

✅ **Documentation:**
- Progress Tracker updated (Issue #2 marked complete)
- Decision Log updated with any implementation choices
- Known limitations documented (if any)

---

## Potential Blockers

**If you encounter these, document and escalate:**

1. **Ship data structure is hardcoded:** Ships stored as fixed coordinate arrays, can't easily add orientation
   - *Action:* Propose data model refactor; estimate effort; confirm with Wayne before proceeding

2. **Grid rendering is complex:** Canvas-based or non-standard grid makes preview difficult
   - *Action:* Document current rendering approach; ask Wayne if simplification is in scope

3. **No client-side validation exists:** Validation only on server, adding client-side validation is large task
   - *Action:* Implement basic client-side validation for rotation; note future improvement in tech debt

4. **Server doesn't support orientation field:** Backend rejects modified ship data structure
   - *Action:* Update server ship model first; may require database migration if ships are persisted

5. **Hit detection breaks with rotation:** Existing hit logic assumes one orientation only
   - *Action:* Locate hit detection logic; update to use `getShipCoordinates()` helper function

---

## Success Metrics

**This issue is successful if:**
- [ ] Wayne can place all ships in any orientation (horizontal or vertical)
- [ ] Invalid placements (out of bounds) are prevented with clear feedback
- [ ] Game plays correctly with rotated ships (hits detected accurately)
- [ ] Works on both mobile and desktop without issues
- [ ] Code is maintainable (next developer can understand orientation logic)

**Time to completion:** Target 2-4 hours; escalate if exceeds 6 hours without progress

---

## Next Steps After Completion

1. Update `PROJECT.md` Progress Tracker (mark Issue #2 complete, note actual time)
2. Commit changes: `Issue #2: Implement ship rotation during placement with client and server validation`
3. Push to GitHub
4. Update GitHub Issue #2 with commit link and any implementation notes
5. Test deployed version (if applicable)
6. Begin Issue #3 (Restart Button) - depends on Issue #1 being complete first