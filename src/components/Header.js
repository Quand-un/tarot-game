import React from 'react';
import '../styles/Game.css';

export default function Header(props) {
    return (
        <>
            {/* <button onClick={ping}>Ping the Server</button> */}
            {!props.join
                ? <>
                    <input
                        className='playerInput'
                        type='text'
                        placeholder='Write your pseudo...'
                        onChange={props.updatePseudo} 
                        onKeyDown={props.sendPseudo}
                    ></input>
                    <button onClick={props.setJoin}>Join</button>
                </>
                : <>
                    {props.gamePhase === 0 && 
                        <>
                            <button onClick={props.playGame}>Play/Distribute</button>
                            {/* <button onClick={props.joinGame}>Join current game</button> */}
                        </>
                    }
                    {props.gamePhase === 3 ? <p>{`${props.gamePhases[props.gamePhase]} (taker score: ${props.score})`}</p> : <p>{props.gamePhases[props.gamePhase]}</p>}
                </>
            }    
        </>
    );
};
