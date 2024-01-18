import user from '../images/user.png';
import React from 'react';
import '../styles/Game.css';

export default function PlayerCards(props) {
    return (
        <div className="player-container">
            {props.players.map((item, index) => (
                <div key={item} className='player'>
                    {props.id === item ? <p>Me</p> : <p>Player {index}</p>}
                    <img alt='profil' src={user} />
                    {(props.isTurn && props.id === item) && <p>Your turn</p>}
                </div>
            ))}
        </div>
    );
};