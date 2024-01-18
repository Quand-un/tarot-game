import React, { useEffect , useState, useCallback } from 'react';
import TakeOrPassMenu from '../components/TakeOrPassMenu';
import PlayerCard from '../components/PlayerCards';
import DeckCards from '../components/DeckCards';
import FoldCards from '../components/FoldCards';
import Popup from '../components/Popup';
import io from 'socket.io-client';
import '../styles/Game.css';

const ENDPOINT = "https://tarot-game.onrender.com";
// const ENDPOINT = "http://localhost:5000";
// const socket = io(ENDPOINT, { autoConnect: true });

function Game() {
    const gamePhases = {
        "-1": 'Waiting for next step...',
        "1": 'Take or pass ?',
        "2": 'Making your chien...',
        "3": 'Game start !',
        "4": 'Game over !'
    };

    const [socket, setSocket] = useState(null);
    const [id, setId] = useState('');
    const [players, setPlayers] = useState([]);
    const [gamePhase, setGamePhase] = useState(0);
    const [gameState, setGameState] = useState({
        deck: [],
        fold: []
    });
    const [isTurn, setIsTurn] = useState(false);
    const [gameResult, setGameResult] = useState({});
    

    const updateState = useCallback((stateFunction, updates) => {
        stateFunction((prevState) => ({
            ...prevState,
            ...updates,
        }));
    }, []);

    const ping = useCallback(() => { socket.emit("ping"); }, [socket]);

    const getDeck = useCallback(() => { socket.emit("getDeck"); }, [socket]);
    
    const playGame = useCallback(() => { socket.emit("playGame"); }, [socket]);

    const takeOrPass = useCallback((isTaken, card) => {
        if (gamePhase === 1 && isTurn) {
            socket.emit("takeOrPass", { isTaken: isTaken, king: card });
            setGamePhase(-1);
        }
    }, [gamePhase, isTurn, socket]);

    const playCard = (cardValue) => {
        if (gamePhase === 3 && isTurn) {
            socket.emit("playCard", cardValue);
        } else if (gamePhase === 2) {
            socket.emit("toChien", cardValue);
        }
    };

    // useEffect(() => {
    //     socket.on("getId", (id) => {
    //         setId(id);
    //     });

    //     socket.on("getPlayers", (clientIds) => {
    //         setPlayers(clientIds);
    //     });

    //     socket.on("setPhase", (phaseNb) => {
    //         setGamePhase(phaseNb);
    //     })

    //     socket.on("getDeck", (deck) => {
    //         if (deck) {
    //             updateState(setGameState, { deck: deck });
    //         }
    //     });

    //     socket.on("setChien", (deck) => {
    //         if (deck) {
    //             updateState(setGameState, { deck: deck });
    //             setGamePhase(2);
    //         }
    //     });

    //     socket.on("getFold", (fold) => {
    //         updateState(setGameState, { fold: fold });
    //     })

    //     socket.on("isTurn", (clientId) => {
    //         id === clientId ? setIsTurn(true) : setIsTurn(false);
    //     });

    //     socket.on("gameOver", (data) => {
    //         setGameResult(data);
    //         setGamePhase(4);
    //     });
    
    //     // return () => {
    //     // //   socket.disconnect();
    //     // };
    //   }, [updateState, id]);

    useEffect(() => {
        const newSocket = io(ENDPOINT, { autoConnect: true });
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on("getId", setId); // <=> socket.on("getId", (id) => { setId(id); });
        socket.on("getPlayers", setPlayers);
        socket.on("setPhase", setGamePhase);
        socket.on("getDeck", (deck) => updateState(setGameState, { deck: deck }));
        socket.on("setChien", (deck) => {
            updateState(setGameState, { deck: deck });
            setGamePhase(2);
        });
        socket.on("getFold", (fold) => updateState(setGameState, { fold: fold }));
        socket.on("isTurn", (clientId) => setIsTurn(id === clientId));
        socket.on("gameOver", (data) => {
            setGameResult(data);
            setGamePhase(4);
        });
        return () => {
            socket.off("getId");
            socket.off("getPlayers");
            socket.off("setPhase");
            socket.off("getDeck");
            socket.off("setChien");
            socket.off("getFold");
            socket.off("isTurn");
            socket.off("gameOver");
        };
    }, [socket, id, updateState]);    

    return (
        <div>
            <div className="menu-container">
                <button onClick={ping}>Ping the Server</button>
                <button onClick={getDeck}>Get my deck</button>
                <button onClick={playGame}>Play a game</button>
                <p>{gamePhases[gamePhase]}</p>
                <TakeOrPassMenu gamePhase={gamePhase} takeOrPass={takeOrPass} />
            </div>
            <PlayerCard id={id} players={players} isTurn={isTurn} />
            <FoldCards fold={gameState.fold} />
            <DeckCards deck={gameState.deck} playCard={playCard} />
            {gamePhase === 4 && <Popup gameResult={gameResult} />}
        </div>
    );
}

export default Game;
