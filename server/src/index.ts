import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MatchManager } from './MatchManager';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all for now, lock down later
        methods: ['GET', 'POST']
    }
});

const matchManager = new MatchManager(io);

// REST Endpoints
app.post('/api/match', (req, res) => {
    const matchId = matchManager.createMatch();
    res.json({ matchId });
});

app.get('/api/match/:id', (req, res) => {
    const match = matchManager.getMatch(req.params.id);
    if (!match) {
        res.status(404).json({ error: 'Match not found' });
        return;
    }
    // Return safe public info if needed, or just 200 OK
    res.json({
        matchId: match.id,
        phase: match.state.phase,
        players: Object.keys(match.state.players).length
    });
});

// Socket.io handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_match', ({ matchId, playerId }) => {
        matchManager.joinMatch(socket, matchId, playerId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Handle disconnect logic via MatchManager if needed
    });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Battlepoos server running on http://localhost:${PORT}`);
});
