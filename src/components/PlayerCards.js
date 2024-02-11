import user from '../assets/images/user.png'; // <a href="https://www.flaticon.com/fr/icones-gratuites/nom-dutilisateur" title="nom d'utilisateur icônes">Nom d'utilisateur icônes créées par Icon Mela - Flaticon</a>
import taker from '../assets/images/taker.png'; // <a href="https://www.flaticon.com/fr/icones-gratuites/couronne" title="couronne icônes">Couronne icônes créées par Freepik - Flaticon</a>
import React from 'react';
import '../styles/Game.css';

export default function PlayerCards(props) {
    return (
        <div className="player-container">
            {props.players.map((player) => (
                <div key={player.id} className='player'>
                    <p>{player.pseudo}</p>
                    {player.id === props.takerId ? <img alt='profil' src={taker} /> : <img alt='profil' src={user} />}
                    {props.turnId === player.id && (props.turnId === props.myId ? <p>My turn</p> : <p>Playing...</p>)}
                </div>
            ))}
        </div>
    );
};