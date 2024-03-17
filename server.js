const Gameplay = require("./src/logic/gameplay.js");
const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 4000;

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 5;

const clients = [];

io.on("connection", (socket) => {
    if (clients.length < MAX_PLAYERS) {
        const pseudo = socket.handshake.query.pseudo;
        
        clients.push({ id: socket.id, socket: socket, pseudo: pseudo, deckIndex: null });
        // console.log(`New client connected: ${socket.id} (${pseudo})`);
        
        socket.emit("setId", socket.id);
        io.emit("setPlayers", clients.map(client => ({ id: client.id, pseudo: client.pseudo })));
    }

    // socket.on("ping", () => console.log(`Ping from ${socket.id}`)); // Dev ping function

    socket.on("playGame", () => { playGame(socket); });

    // socket.on("joinGame", () => { joinGame(socket); });

    socket.on("takeOrPass", (data) => { takeGame(socket, data); });

    socket.on("toChien", (card) => { toChien(socket, card); })

    socket.on("playCard", (card) => { playCard(socket, card); });

    socket.on("disconnect", () => {
        const index = clients.findIndex(client => client.id === socket.id);
        if (index !== -1) { clients.splice(index, 1); }
        io.emit("players", clients.map(client => client.id));
        // console.log("Client disconnected");
        socket.removeAllListeners();
    });
});

const game = new Gameplay(MIN_PLAYERS);

function playGame(socket) {
    if (clients.length >= MIN_PLAYERS && clients.length <= MAX_PLAYERS) {
        game.reset(clients.length);
        clients.forEach(client => client.deckIndex = null);
        
        game.start(clients.findIndex(client => client.id === socket.id)); // Shuffle + distribute cards + initiate currentTurn
        emitDecks(); // Send deck to each players
        io.emit("setPhase", 1);
        emitTurn();
    }
}

function emitDecks() {
    const clientsWithoutDeck = clients.filter(client => client.deckIndex === null);
    clientsWithoutDeck.forEach(client => {
        emitDeckToClient(client);
    });
}

function emitDeckToClient(client) {
    const decks = game.getDecks();
    const deckIndexesUsed = clients.map(client => client.deckIndex);
    const deckIndexAvailable = decks.findIndex((value, index) => !deckIndexesUsed.includes(index));

    client.socket.emit("setDeck", decks[deckIndexAvailable]);
    client.deckIndex = deckIndexAvailable;
    // console.log(`Deck ${deckIndexAvailable} --> ${client.id}`);
}

/* function joinGame(socket) {
    const client = getClientById(socket.id);

    if (client.deckIndex === null) {
        emitDeckToClient(client);
    }
    socket.emit("setFold", game.getFold());
    socket.emit("setPhase", 3);
    if (client.deckIndex === game.getTurn()) {
        socket.emit("setTurnId", client.id);
    }
} */

function takeGame(socket, data) {
    const deckIndex = data.isTaken ? getClientById(socket.id).deckIndex : null;
    const newPhase = game.setTaker(deckIndex, data.king);

    if (newPhase === -1) {
        playGame(socket);
    } else if (newPhase === 2) {
        const client = clients.find(client => client.deckIndex === game.getTaker());
        // io.emit("getChien", { chien: game.getChien(), takerId: client.id });
        io.emit("setFold", game.getChienAsFold());
        client.socket.emit("setChien", game.getDeck(client.deckIndex));
    }

    if (data.isTaken) { io.emit("setTakerId", socket.id); }
    emitTurn();
}

function toChien(socket, card) {
    // console.log(`Card ${card} --> chien`);
    
    const client = getClientById(socket.id);
    const isCompleted = game.toChien(client.deckIndex, card);
    client.socket.emit("setDeck", game.getDeck(client.deckIndex));

    if (isCompleted) {
        io.emit("setPhase", 3);
    }
}

function playCard(socket, card) {
    // console.log(`Card ${card} --> baize`);
    
    const client = getClientById(socket.id);
    if (client.deckIndex === game.getTurn()) {
        const validCard = game.checkPlay({ pseudo: client.pseudo, deckIndex: client.deckIndex }, card);
        if (validCard) {
            socket.emit("setDeck", game.getDeck(client.deckIndex));
            io.emit("setFold", game.getFold());
            emitTurn();

            if (game.isBaizeFull()) {
                io.emit("setScore", game.getScore());

                const isGameOver = game.isGameOver();
                if (isGameOver !== null) {
                    io.emit("setGameOver", isGameOver);
                }
            }
        }
    }   
}

function emitTurn() {
    const client = clients.find(client => client.deckIndex === game.getTurn());
    if (client) {
        io.emit("setTurnId", client.id);
    }
}

function getClientById(id) {
    return clients.find(client => client.id === id);
}

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});