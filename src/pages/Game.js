import React, { useEffect , useState, useCallback } from 'react';
import useSound from 'use-sound';
import Header from '../components/Header';
import TakeOrPassMenu from '../components/TakeOrPassMenu';
import PlayerCard from '../components/PlayerCards';
import DeckCards from '../components/DeckCards';
import FoldCards from '../components/FoldCards';
import Popup from '../components/Popup';
import { generatePseudo } from '../logic/pseudoGenerator';
import io from 'socket.io-client';
import '../styles/Game.css';
import turnSound from '../assets/sounds/turnSound.mp3';

const ENDPOINT = "https://tarot-game.onrender.com";
// const ENDPOINT = "http://localhost:5000";

function Game() {
    const gamePhases = {
        "-1": 'Waiting for the dog...',
        "1": 'Take or pass ?',
        "2": 'Making your dog...',
        "3": 'Game start !',
        "4": 'Game over !'
    };

    const [socket, setSocket] = useState(null);
    const [pseudo, setPseudo] = useState(generatePseudo());
    const [myId, setMyId] = useState('');
    const [players, setPlayers] = useState([]);
    const [gamePhase, setGamePhase] = useState(0);
    const [deck, setDeck] = useState([]);
    const [fold, setFold] = useState({ cards: [], pseudos: [] });
    const [turnId, setTurnId] = useState('');
    const [gameResult, setGameResult] = useState({ winner: '', score: 0, oudlersNb: 0 });
    const [takerId, setTakerId] = useState('');
    const [join, setJoin] = useState(false);

    const [playTurnSound] = useSound(turnSound);

    const sendPseudo = useCallback((e) => {    
        if (e.key === 'Enter' && !join) {
            setJoin(true);
        }
    }, [join]);

    const updatePseudo = useCallback((e) => {    
        if (!join && e.target.value.length <= 8) {
            setPseudo(e.target.value);
        }
    }, [join]);

    const updateState = useCallback((stateFunction, updates) => {
        stateFunction((prevState) => ({
            ...prevState,
            ...updates,
        }));
    }, []);

    // const ping = useCallback(() => { socket.emit("ping"); }, [socket]);
    
    const isMyTurn = useCallback(() => { return turnId === myId; }, [turnId, myId]);

    // const joinGame = useCallback(() => { socket.emit("joinGame"); }, [socket]);
    
    const playGame = useCallback(() => { 
        socket.emit("playGame");
    }, [socket]);

    const takeOrPass = useCallback((isTaken, card) => {
        if (gamePhase === 1 && isMyTurn()) {
            socket.emit("takeOrPass", { isTaken: isTaken, king: card });
            setGamePhase(-1);
        }
    }, [gamePhase, isMyTurn, socket]);

    const playCard = (cardValue) => {
        if (gamePhase === 3 && isMyTurn()) {
            socket.emit("playCard", cardValue);
        } else if (gamePhase === 2) {
            socket.emit("toChien", cardValue);
        }
    };

    useEffect(() => {
        if (join) {
            const newSocket = io(ENDPOINT, { 
                autoConnect: true,
                query: { pseudo: pseudo }
            });
            setSocket(newSocket);
            return () => newSocket.disconnect();
        }
    }, [join, pseudo]);

    useEffect(() => {
        if (!socket) return;
        socket.on("setId", setMyId); // <=> socket.on("getId", (id) => { setId(id); });
        socket.on("setPlayers", setPlayers);
        socket.on("setPhase", (phase) => {
            setGamePhase(phase);
            if (phase === 1) {
                setFold({ cards: [], pseudos: [] });
                setGameResult({ winner: '', score: 0, oudlersNb: 0 });
                setTakerId('');
            }
        });
        socket.on("setDeck", (deck) => setDeck(deck));
        // socket.on("setTurnId", setTurnId);
        socket.on("setTurnId", (turnId) => {
            setTurnId(turnId);
            if (turnId === myId) { playTurnSound(); }
        });
        socket.on("setTakerId", setTakerId);
        socket.on("setChien", (deck) => {
            setDeck(deck);
            setGamePhase(2);
        });
        socket.on("setFold", (data) => setFold(data));
        socket.on("setScore", (score) => updateState(setGameResult, { score: score }));
        socket.on("setGameOver", (data) => {
            setGameResult(data);
            setGamePhase(4);
        });
        return () => {
            socket.off("setId");
            socket.off("setPlayers");
            socket.off("setPhase");
            socket.off("setDeck");
            socket.off("setTurnId");
            socket.off("setTakerId");
            socket.off("setChien");
            socket.off("setFold");
            socket.off("setScore");
            socket.off("setGameOver");
        };
    }, [socket, myId, updateState, playTurnSound]);    

    return (
        <div>
            <div className="menu-container">
                <Header 
                    gamePhases={gamePhases}
                    gamePhase={gamePhase}
                    join={join}
                    score={gameResult.score}
                    updatePseudo={updatePseudo}
                    sendPseudo={sendPseudo}
                    setJoin={() => {setJoin(true)}}
                    playGame={playGame}
                    // joinGame={joinGame}
                />
                <TakeOrPassMenu gamePhase={gamePhase} takeOrPass={takeOrPass} />
            </div>
            <PlayerCard myId={myId} players={players} turnId={turnId} takerId={takerId} />
            <FoldCards fold={fold.cards} pseudos={fold.pseudos} />            
            <DeckCards deck={deck} playCard={playCard} />
            {gamePhase === 4 && <Popup gameResult={gameResult} playGame={playGame} />}
        </div>
    );
}

export default Game;