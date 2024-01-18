import React from 'react';
import '../styles/Game.css';

// export default function FoldCards(props) {
//     const style = {
//         maxWidth: `calc(85% / ${props.fold.length})`,
//     };

//     return (
//         <div className="game-container">
//             {props.fold.map((card, index) => (
//                 <img 
//                     key={index} 
//                     alt={card} 
//                     src={require(`../images/cards/${card}.jpg`)} 
//                     style={style}
//                 />
//             ))}
//         </div>
//     );
// };

export default function FoldCards(props) {
    const style = {
        maxWidth: `calc(85% / ${props.fold.length})`,
    };

    const cardImages = props.fold.reduce((images, card) => {
        images[card] = require(`../images/cards/${card}.jpg`);
        return images;
    }, {});

    return (
        <div className="game-container">
            {props.fold.map((card) => (
                <img 
                    key={card} 
                    alt={card} 
                    src={cardImages[card]} 
                    style={style}
                />
            ))}
        </div>
    );
};
