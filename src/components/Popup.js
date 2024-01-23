import React from 'react';
import '../styles/Game.css';

export default function Popup(props) {
  return (
    <div className="popup">
      <div className="popup-content">
        <h2>{props.gameResult.winner} win</h2>
        <p>Taker score: <b>{props.gameResult.score}</b></p>
        <p>Number of oudlers: <b>{props.gameResult.oudlersNb}</b></p>
      </div>
      <button onClick={props.playGame}>Play again</button>
    </div>
  );
};