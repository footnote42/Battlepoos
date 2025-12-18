import { MatchManager } from './MatchManager';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import Client, { Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';

// Use a real socket server for testing to ensure full flow works

let io: Server;
let serverSocket: Socket;
let clientSocket1: ClientSocket;
let clientSocket2: ClientSocket;
let httpServer: any;
let port: number;

const setup = () => new Promise<void>((resolve) => {
    httpServer = createServer();
    io = new Server(httpServer);

    httpServer.listen(() => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
    });
});

const teardown = () => {
    io.close();
    clientSocket1.close();
    if (clientSocket2) clientSocket2.close();
    httpServer.close();
};

const run = async () => {
    // console.log('Starting Server Test...');
    await setup();

    const matchManager = new MatchManager(io);

    // Set up socket event handlers (missing from original test)
    io.on('connection', (socket) => {
        socket.on('join_match', ({ matchId, playerId }) => {
            matchManager.joinMatch(socket, matchId, playerId);
        });
    });

    const matchId = matchManager.createMatch();
    // console.log('Match created:', matchId);

    // Connect Client 1
    clientSocket1 = Client(`http://localhost:${port}`);

    await new Promise<void>(resolve => {
        clientSocket1.on('connect', resolve);
    });
    // console.log('Client 1 connected');

    // Join Match
    clientSocket1.emit('join_match', { matchId });

    // Wait for state update
    await new Promise<void>(resolve => {
        clientSocket1.once('state_update', (state) => {
            // console.log('Client 1 received state:', state.phase);
            if (state.phase !== 'lobby') {
                console.error('Unexpected phase:', state.phase);
            }
            resolve();
        });
    });

    // Connect Client 2
    clientSocket2 = Client(`http://localhost:${port}`);
    await new Promise<void>(resolve => {
        clientSocket2.on('connect', resolve);
    });
    // console.log('Client 2 connected');

    clientSocket2.emit('join_match', { matchId });

    // Wait for placement phase
    await new Promise<void>(resolve => {
        clientSocket2.once('state_update', (state) => {
            // console.log('Client 2 received state:', state.phase);
            if (state.phase === 'placement') {
                // console.log('Phase is placement! Success.');
                resolve();
            }
        });
    });

    console.log('Tests Passed!');
    teardown();
    process.exit(0);
};

run().catch(err => {
    console.error(err);
    process.exit(1);
});
