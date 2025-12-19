# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Battlepoos is a real-time multiplayer turn-based naval combat game (Battleship clone) with a humorous "poo" theme. Built using a monorepo structure with separate client, server, and shared packages.

**Tech Stack:**
- Frontend: React (Vite), TypeScript, Tailwind CSS, Zustand (state management), React DnD
- Backend: Node.js, Express, Socket.io, TypeScript
- Shared: Common TypeScript types and game logic shared between client and server

## Repository Structure

```
Battlepoos/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # React components (Lobby, Placement, Battle, Board, ToastContainer)
│       ├── game/         # Zustand stores (store.ts, toastStore.ts)
│       └── shared/       # Duplicated shared code (types, logic, audio)
├── server/          # Node.js backend
│   └── src/
│       ├── index.ts           # Express + Socket.io server entry point
│       ├── MatchManager.ts    # Creates and manages game matches
│       ├── Match.ts           # Individual match state and game logic
│       └── logic.ts           # Duplicated shared game logic
└── shared/          # Shared TypeScript definitions and logic
    └── src/
        ├── index.ts      # Exports types and logic
        ├── types.ts      # Game state types (Ship, Coordinate, GameState, etc.)
        ├── logic.ts      # Core game logic (placement validation, shot resolution)
        └── test_logic.ts # Basic logic tests
```

## Development Commands

### Install Dependencies
```bash
# Server
cd server
npm install

# Client
cd client
npm install

# Shared (if needed)
cd shared
npm install
```

### Running Development Servers

**You need two terminals:**

1. Start the server:
```bash
cd server
npm run dev
```
Server runs on `http://localhost:3000`

2. Start the client:
```bash
cd client
npm run dev
```
Client typically runs on `http://localhost:5173`

### Build

```bash
# Client
cd client
npm run build

# Client build also runs TypeScript compilation
cd client
npm run build  # Runs: tsc && vite build
```

### Linting

```bash
# Client
cd client
npm run lint
```

### Testing

There are basic logic tests in `shared/src/test_logic.ts`. Run with:
```bash
cd shared
npx ts-node src/test_logic.ts
```

Server integration tests exist in `server/src/test_server.ts` (uses socket.io-client to test server behavior).

## Architecture Notes

### Shared Code Pattern

The project uses a **duplicated shared code approach** rather than proper package linking:
- `shared/src/` contains the canonical types and logic
- `client/src/shared/` has duplicated copies of types and logic
- `server/src/` also has duplicated `logic.ts`

**Important:** When modifying shared code (types, game logic), you must update ALL three locations:
1. `shared/src/types.ts` and `shared/src/logic.ts` (canonical)
2. `client/src/shared/types.ts` and `client/src/shared/logic.ts`
3. `server/src/logic.ts`

The server imports from `../../shared/src` while the client imports from local `shared/` directory.

### Client Architecture

**State Management (Zustand):**
- `client/src/game/store.ts` - Main game store, manages Socket.io connection, game state, and network actions
- `client/src/game/toastStore.ts` - Toast notification state

**Socket.io Events:**
- Client connects to server on `http://localhost:3000`
- Emits: `join_match`, `place_ships`, `fire_shot`, `restart_game`
- Receives: `state_update`, `error`, `event` (for hit/miss/sunk with audio triggers), `game_reset`

**Components:**
- `Lobby.tsx` - Match creation and joining UI
- `Placement.tsx` - Ship placement phase (click-to-place with rotation)
- `Battle.tsx` - Active combat phase
- `Board.tsx` - Reusable grid component for both player and opponent boards
- `GameOver.tsx` - Game completion screen with winner/loser differentiation
- `MuteToggle.tsx` - Sound mute/unmute control
- `ToastContainer.tsx` - Toast notifications

### Server Architecture

**Key Classes:**
- `MatchManager` - Creates matches, manages match registry (Map), handles player joining
- `Match` - Encapsulates individual game state, validates moves, broadcasts state updates

**Match State:**
- Stores `GameState` which includes phase, players, turn, winner
- Each `PlayerBoard` has ships and shots (Map<string, CellState>)
- State is **masked** when sent to clients - opponents' ships are hidden unless sunk or game finished

**REST Endpoints:**
- `POST /api/match` - Create a new match, returns matchId
- `GET /api/match/:id` - Get match info (phase, player count)

**Socket.io Events:**
- `connection` - Client connects
- `join_match` - Player joins a match (creates or reconnects)
- Server emits `state_update` (masked per player), `error`, `event`

### Game Logic

Core game logic lives in `shared/src/logic.ts`:
- `isValidCoordinate(c)` - Check if coordinate is within 10x10 board
- `getShipCoordinates(ship)` - Calculate all cells occupied by a ship
- `isValidPlacement(ship, existingShips)` - Validate ship placement (bounds, no overlap)
- `resolveShot(board, target)` - Calculate shot result (miss/hit/sunk)
- `isGameOver(board)` - Check if all ships are sunk

**Important Implementation Details:**
- Ships are identified by unique `id` (allows moving during placement)
- Shots are stored as Map<string, CellState> with key format `"x,y"`
- Shot resolution counts existing shots + current shot to determine if ship is sunk
- Maps are serialized to arrays `[[key, value]]` when sent over Socket.io

### Known Issues

1. **Typo in shared/src/types.ts**: `GamePhase` includes `'lobpy'` instead of `'lobby'`
2. **Code duplication**: Shared code is manually copied rather than using npm workspaces or symlinks
3. The git status shows `server/src/logic.ts` as a new untracked file, indicating it may be a duplicate

## Game Flow

1. **Lobby Phase**: Player 1 creates match, Player 2 joins with matchId
2. **Placement Phase**: Both players place 5 ships (Carrier=5, Battleship=4, Cruiser=3, Submarine=3, Destroyer=2)
   - Ships can be rotated horizontal/vertical before placement
   - Randomize button for quick ship placement
3. **Active Phase**: Players take turns firing shots at opponent's board
4. **Finished Phase**: Game ends when all of one player's ships are sunk
   - Winner sees "Victory!" message (green styling)
   - Loser sees "Defeat!" message (gray styling)
   - Players can restart game or return to lobby

## Audio and Visuals

- Audio effects via `client/src/shared/audio.ts` (hit, miss, sink, place, win, lose sounds)
- Mute toggle available on all game screens (persists in localStorage)
- Sounds respect tab focus (don't play when tab is hidden)
- Toast notifications for game events
- Humorous poo-themed emojis: 💧 miss, 💥 hit, 💩 sunk, 🚢 ship

## TypeScript Configuration

- **Client**: ESNext modules, bundler resolution, JSX for React
- **Server**: CommonJS modules, outputs to `dist/`, rootDir is `src/`
- Both use strict mode and ES2020 target
