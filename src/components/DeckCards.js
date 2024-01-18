import React from 'react';
import '../styles/Game.css';

// export default function DeckCards(props) {
//     const style = {
//         maxWidth: `calc(85% / ${props.deck.length})`,
//     };

//     return (
//         <div className="deck-container">
//             {props.deck.map((card, index) => (
//                 <img 
//                     key={index} 
//                     alt={card} 
//                     src={require(`../images/cards/${card}.jpg`)} 
//                     onClick={() => props.playCard(card)} 
//                     style={style}
//                 />
//             ))}
//         </div>
//     );
// };

export default function DeckCards(props) {
    const style = {
        maxWidth: `calc(85% / ${props.deck.length})`,
    };

    const cardImages = props.deck.reduce((images, card) => {
        images[card] = require(`../images/cards/${card}.jpg`);
        return images;
    }, {});

    return (
        <div className="deck-container">
            {props.deck.map((card) => (
                <img 
                    key={card} 
                    alt={card} 
                    src={cardImages[card]} 
                    onClick={() => props.playCard(card)} 
                    style={style}
                />
            ))}
        </div>
    );
};
