import React from 'react';
import '../styles/Game.css';

export default function TakeOrPassMenu(props) {
    const cardImages = {
        114: require(`../images/114.png`),
        214: require(`../images/214.png`),
        314: require(`../images/314.png`),
        414: require(`../images/414.png`),
    };
    
    return (
        <>
            {props.gamePhase === 1 && 
                <>
                    <button onClick={() => props.takeOrPass(false)}>Pass</button>
                    {[114, 214, 314, 414].map((card) => (
                        <button key={card} onClick={() => props.takeOrPass(true, card)}>
                            Take
                            <img alt={card} src={cardImages[card]} />
                        </button>
                    ))}

                </>
            }
        </>
    );
};