# 💩 Battlepoos

A humorous, turn-based multiplayer naval combat game... with a twist. Built with React, Node.js, and Socket.io.

## 🚀 Features

*   **Real-time Multiplayer:** Instant matchmaking and live state synchronization using WebSockets.
*   **Humorous Theme:** "Poo" themed ships and sound effects (farts included).
*   **Interactive Gameplay:** Click-to-place ship placement with rotation and grid-based combat.
*   **Complete Game Loop:** Winner/loser differentiation, restart functionality, and return to lobby.
*   **Sound Effects:** Hit, miss, sink, win, and lose sounds with mute toggle (respects tab focus).
*   **Responsive Design:** Works on desktop and mobile devices.
*   **Visual Polish:** Toast notifications for game events and smooth animations.

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, Zustand (State Management).
*   **Backend:** Node.js, Express, Socket.io, TypeScript.
*   **Shared:** Common Type definitions and validation logic shared between client/server.

## 🏁 Quick Start

### Prerequisites
*   Node.js (v16+)
*   npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/footnote42/Battlepoos.git
    cd Battlepoos
    ```

2.  **Install Dependencies:**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    
    # Install shared dependencies (if any specific, usually local link)
    # The project uses a simple file copy approach for shared logic currently.
    ```

### Running the Game

You need two terminals.

1.  **Start the Server:**
    ```bash
    cd server
    npm run dev
    ```
    *Server runs on `http://localhost:3000`*

2.  **Start the Client:**
    ```bash
    cd client
    npm run dev
    ```
    *Client runs on `http://localhost:5173` (typically)*

3.  **Play:**
    *   Open two browser windows/tabs to the client URL.
    *   **Player 1:** Click "Create Match".
    *   **Player 2:** Enter the Match ID (from P1's screen) and click "Join".
    *   Place your ships and fight!

## 📜 Game Rules

1.  **Objective:** Sink all 5 of your opponent's ships before they sink yours.
2.  **Setup:** Place your fleet on the 10x10 grid. You can rotate ships or use the Randomize button.
    *   **Carrier (5 cells)**
    *   **Battleship (4 cells)**
    *   **Cruiser (3 cells)**
    *   **Submarine (3 cells)**
    *   **Destroyer (2 cells)**
3.  **Combat:** Players take turns firing shots at the opponent's grid.
    *   **Miss:** Water Splash 💧
    *   **Hit:** Explosion 💥
    *   **Sunk:** Poo 💩
4.  **Winning:** The first player to sink all opponent ships wins!
    *   Winners see "Victory!" message (green)
    *   Losers see "Defeat!" message (gray)
    *   Choose "Play Again" to restart or "Return to Lobby" to find a new opponent.

## 🤝 Contributing

Feel free to fork and submit a Pull Request if you have ideas to make it even smellier (in a good way).
