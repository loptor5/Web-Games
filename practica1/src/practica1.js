/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

// Enumerado con el estado de las cartas
var cardState = {
    "uncovered": 1,
    "up": 2,
    "down": 3
};

/**
 * Constructora de MemoryGame: recibe como parámetro el servidor gráfico, usado posteriormente para dibujar.
 */
MemoryGame = function(gs) {
    //----ATRIBUTOS----

    this.cards =[];
    this.uncoveredCards = 0;
    this.message = "Memory Game";
    this.graphics = gs;
    //----EXTRA----
    this.numCards = 16; // Numero de cartas por defecto
    this.flipped = -1; // id de carta volteada
    this.continue = true; // cerrojo
    this.timer;

    var that = this;

    //----FUNCIONES----

    // Funcion para ordenar aleatoriamente el array
    this.shuffle = function(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    };

    // Funcion que comprueba si se ha ganado
    this.checkEnd = function() {
        return (that.uncoveredCards == that.numCards);
    };

    /** 
     * Inicializa el juego creando las cartas (recuerda que son 2 de cada tipo de carta), 
     * desordenándolas y comenzando el bucle de juego.
     */
    this.initGame = function() {
        var all = Object.keys(that.graphics.maps);
        all.splice(1, 1); // quita las cartas de "back" del array de cartas
        var all2 = all.concat(all);

        for (var j = 0; j < 16; j++) {
            var card = new MemoryGameCard(all2[j]);
            that.cards.push(card);
        }

        that.shuffle(that.cards);

        that.loop();
    };

    // Dibuja el juego, esto es: (1) escribe el mensaje con el estado actual
    // del juego y (2) pide a cada una de las cartas del tablero que se dibujen.
    this.draw = function() {
        that.graphics.drawMessage(that.message);

        for (var i = 0; i < that.numCards; i++) {
            that.cards[i].draw(that.graphics, i);
        }
    };

    // Es el bucle del juego. En este caso es muy sencillo: llamamos al
    // método draw cada 16ms (equivalente a unos 60fps). Esto se realizará con
    // la función setInterval de Javascript.
    this.loop = function() {
        that.timer = setInterval(that.draw, 16);
    };

    // Este método se llama cada vez que el jugador pulsa
    // sobre alguna de las cartas (identificada por el número que ocupan en el
    // array de cartas del juego). Es el responsable de voltear la carta y, si hay
    // dos volteadas, comprobar si son la misma (en cuyo caso las marcará como
    // encontradas). En caso de no ser la misma las volverá a poner boca abajo
    this.onClick = function(cardId) {
        if(cardId !== undefined && that.cards[cardId].state === cardState.down  && that.continue) {
            that.cards[cardId].flip();
            that.cards[cardId].state = cardState.up; // ponemos la carta boca arriba

			if (that.flipped === -1) {
                that.flipped = cardId;
			} else {
				if (that.cards[cardId].compareTo(that.cards[that.flipped])) {
					that.cards[cardId].found();
					that.cards[that.flipped].found();
					that.uncoveredCards += 2;
					that.message = "Match found!!";
                    that.flipped = -1;

                    that.continue = false;
                    setTimeout(function() {
                        that.message = "Memory Game";
						that.continue = true;
                    },1000);
                    
					if(that.checkEnd()){
                        that.message = "You Win!!";
                        that.draw();
                        clearInterval(that.timer);
                        that.continue = false; // paro la ejecucion
					}

				} else {
                    that.message = "Try again";

                    that.continue = false;
					setTimeout(function() {
						that.cards[cardId].flip();
						that.cards[that.flipped].flip();
                        that.message = "Memory Game";
                        that.flipped = -1;
                        that.continue = true;
					},1000);
				}
			}
		}
    };
};



/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function(id) {
    //----ATRIBUTOS----

    this.sprite = id;
    this.state = cardState.down;

    var that2 = this;

    //----FUNCIONES----

    // Da la vuelta a la carta, cambiando el estado de la misma.
    this.flip = function() {
        that2.state == cardState.down ? that2.state = cardState.up : that2.state = cardState.down;
    };

    // Marca una carta como encontrada, cambiando el estado de la misma.
    this.found = function() {
        that2.state = cardState.uncovered;
    };

    // Compara dos cartas, devolviendo true si ambas representan la misma carta.
    this.compareTo = function(otherCard) {
        return (that2.sprite == otherCard.sprite);
    };

    // Dibuja la carta de acuerdo al estado en el que se encuentra.
    // Recibe como parámetros el servidor gráfico y la posición en la que se
    // encuentra en el array de cartas del juego (necesario para dibujar una
    // carta).
    this.draw = function(gs, pos) {
        that2.state == cardState.down ? gs.draw("back", pos) : gs.draw(that2.sprite, pos);
    };
};
