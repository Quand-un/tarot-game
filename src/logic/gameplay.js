class Gameplay {
    constructor(clientNb) {
        this.reset(clientNb);
    }

    reset(clientNb){
        this.cards = Array.from({ length: 22 }, (_, i) => i)
            .concat(Array.from({ length: 14 }, (_, i) => i + 101))
            .concat(Array.from({ length: 14 }, (_, i) => i + 201))
            .concat(Array.from({ length: 14 }, (_, i) => i + 301))
            .concat(Array.from({ length: 14 }, (_, i) => i + 401));

        this.playerNb = clientNb;
        this.chienNb = 78%(3*this.playerNb);
        this.turnNb = (78-this.chienNb)/(3*this.playerNb);

        this.decks = Array.from({ length: this.playerNb }, () => []);
        this.chien = [];
        this.folds = {
            baize: [],
            taker: null,
            ally: null,
            won: [],
            hasExcuse: false,
            score: 0
        };
        
        this.totalTurn = 0
        this.currentTurn = 0;
    }

    start(playerIndex) {
        this.shuffleCards();
        this.distributeCards();
        this.setTurn(playerIndex);
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            // Generate a random index
            const j = Math.floor(Math.random() * (i + 1));
    
            // Swap elements at indices i and j
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    distributeCards() {
        while (this.chien.length !== this.chienNb) {
            var index = this.getRandomIndex(this.cards.length-1);
            this.chien.push(this.cards[index]);
            this.cards.removeByIndex(index);
        }
        
        for (let t = 0; t < this.turnNb; t++) {
            for (let p = 0; p < this.playerNb; p++) {
                if (this.cards.length < 3) { break; }
                this.decks[p].push(...this.cards.splice(0, 3));
            }
        }

        this.decks.forEach(deck => {
            this.sortDeck(deck);
        });
    }

    setTurn(playerIndex){ 
        this.currentTurn = playerIndex;
        this.nextTurn();
    }

    setTaker(deckIndex, king) {
        if (deckIndex !== null) {
            this.folds.taker = deckIndex;   
        }

        if (this.totalTurn === this.playerNb) {
            this.nextTurn();
            if (this.folds.taker === null) {
                return -1; // all players passed
            } else {
                this.decks[this.folds.taker].push(...this.chien);
                this.sortDeck(this.decks[this.folds.taker]);

                if (this.playerNb === 5) {
                    this.folds.ally = this.decks.findIndex(deck => deck.includes(king));
                }

                if (this.decks[this.folds.taker].includes(0) || (this.playerNb === 5 && this.decks[this.folds.ally].includes(0))) {
                    this.folds.hasExcuse = true;
                }
                return 2; // call phase 2, there is a taker
            }
        }
        this.nextTurn();
        return 1; // still in phase 1, all players didn't took or passed
    }

    toChien(deckIndex, card){
        if (![0, 1, 21, 114, 214, 314, 414].includes(card)) {
            this.folds.won.push(card);
            this.decks[deckIndex].removeByValue(card);
        }
        return this.folds.won.length === this.chienNb;
    }
    
    checkPlay(deckIndex, card) {
        if (this.folds.baize.length >= this.playerNb) { this.folds.baize = []; } // Continue to display the last fold before a new play

        if (!this.isValidCard({player: deckIndex, card: card})) { return false; }
        
        this.folds.baize.push({player: deckIndex, card: card}); // Add in baize fold
        this.decks[this.currentTurn].removeByValue(card); // Remove from deck

        if (this.folds.baize.length >= this.playerNb) {
            const winner = this.getWinningCard(this.folds.baize);
            const takerWin = winner.player == this.folds.taker || (this.playerNb === 5 && winner.player == this.folds.ally);

            if (this.folds.baize.some(play => play.card === 0)) {
                if (takerWin && !this.folds.hasExcuse) {
                    this.folds.score -= 4;
                } else if (!takerWin && this.folds.hasExcuse) {
                    this.folds.score += 4;
                }
            }
            
            if (takerWin) {                
                this.folds.won.push(...this.folds.baize.map(play => play.card));
                this.folds.score = this.calculateScore(this.folds.won);
                console.log(`Won fold (score: ${this.folds.score}) <--`, winner);
            }
            this.currentTurn = winner.player;
        } else {
            this.nextTurn();
        }
        return true;
    }

    isValidCard(newPlay) {
        let firstPlay = this.folds.baize[0]; // Get the card played by the first player
    
        if (!firstPlay || firstPlay.card === 0 || newPlay.card === 0) { return true; } // If the new card is the first card being played or card 0, it's always valid
    
        let firstColor = Math.floor(firstPlay.card / 100); // Determine the color of the first card
    
        let playerDeck = this.decks[newPlay.player]; // Get the player's deck
        
        let bestAtout = Math.max(...this.folds.baize.filter(play => play.card >= 1 && play.card <= 21).map(play => play.card));
        
        let hasSuperiorAtout = playerDeck.some(card => card >= 1 && card <= 21 && card > bestAtout);
    
        // If the first color is 0 and the player has a superior card of the same color, they must play it
        if (firstColor === 0 && newPlay.card < bestAtout && hasSuperiorAtout) { return false; }

        let sameColor = Math.floor(newPlay.card / 100) === firstColor; // Check if the new card is the same color as the first card
    
        // If the new card is the same color as the first card, it's valid
        if (sameColor) { return true; }

        let hasColor = playerDeck.some(card => Math.floor(card / 100) === firstColor); // Check if the player has a card of the first color in their deck
    
        let isAtout = newPlay.card >= 1 && newPlay.card <= 21; // Check if the new card is between 1 and 21
        
        let hasAtout = playerDeck.some(card => card >= 1 && card <= 21); // Check if the player has a card between 1 and 21 in their deck
    
        // If the player doesn't have the color of the first card in their deck
        if (!hasColor) {
            if (isAtout) {  // If the new card is between 1 and 21, it's valid
                // But if another player has already played a card between 1 and 21, the new card must be superior
                if (newPlay.card < bestAtout && hasSuperiorAtout) { return false; }
                return true;
            }
            if (!hasAtout) { return true; } // If the player doesn't have a card between 1 and 21 in their deck, any card is valid
        }
        return false; // If none of the above conditions are met, the play is not valid
    }    
    
    getWinningCard(baize) {
        let sortedBaize = [...baize].sort((a, b) => b.card - a.card);
        let winningPlay = sortedBaize.find(play => play.card >= 1 && play.card <= 21);

        return winningPlay ? winningPlay : sortedBaize[0];
    }
    
    calculateScore(fold) {
        const points = {
            0: 4.5, 1: 4.5, 21: 4.5,
            111: 1.5, 211: 1.5, 311: 1.5, 411: 1.5,
            112: 2.5, 212: 2.5, 312: 2.5, 412: 2.5,
            113: 3.5, 213: 3.5, 313: 3.5, 413: 3.5,
            114: 4.5, 214: 4.5, 314: 4.5, 414: 4.5
        };
    
        let score = 0;
        for (let card of fold) {
            if (points.hasOwnProperty(card)) {
                score += points[card];
            } else if ((card >= 2 && card <= 20) || ((card - 1) % 100 >= 0 && (card - 1) % 100 <= 9)) {
                score += 0.5;
            }
        }
        return score;
    }

    isGameOver() {
        if (!this.decks.find(deck => deck.length !== 0)) {
            const availableOudlers = [1, 21];
            if (this.folds.hasExcuse) { availableOudlers.push(0); }
            
            const scoreToWin = {
                "0": 56,
                "1": 51,
                "2": 41,
                "3": 36
            };

            const oudlersNb = [...this.folds.won.filter(card => availableOudlers.includes(card))].length;
            return { 
                winner: this.folds.score >= scoreToWin[oudlersNb] ? "Taker" : "Defender", 
                oudlersNb: oudlersNb, 
                score: this.folds.score
            };
        }
        return null;
    }
    
    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.playerNb;
        this.totalTurn++;
        return this.currentTurn;
    }

    sortDeck(deck) { return deck.sort((a, b) => a - b); }
    
    getRandomIndex(max) { return Math.floor(Math.random() * max); }
    
    getTurn() { return this.currentTurn; }
    getDeck(playerIndex){ return this.decks[playerIndex]; }
    getDecks(){ return this.decks; }
    getFold(){ return this.folds.baize.map(play => play.card); }
    getChien(){ return this.chien; }
    getTaker(){ return this.folds.taker; }
}

Array.prototype.removeByIndex = function (index) {
    this.splice(index, 1);
    return this;
}

Array.prototype.removeByValue = function (value) {
    let index = this.indexOf(value);
    this.splice(index, 1);
    return this;
}

module.exports = Gameplay;