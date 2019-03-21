// Especifica lo que se debe pintar al cargar el juego
var startGame = function () {
  var board = new GameBoard();
  board.add(new froggerLogo());
  board.add(new TitleScreen("2019", "Press 'SPACE' to start playing", playGame))
  Game.setBoard(0, board );
}



var playGame = function () {
  var board = new GameBoard();

  board.add(new Background());
  board.add(new Water());
  board.add(new Grass());
  board.add(new Spawn(winGame));
  board.add(new PlayerFrog());

  Game.setBoard(1, board); // Pinta el board
  Game.setBoard(2, null); // Para quitar el titleScreen
}

var winGame = function () {
  Game.setBoard(2, new TitleScreen("You win!", "Press 'SPACE' to play again", playGame));
};


var loseGame = function () {
  Game.setBoard(2, new TitleScreen("You lose!", "Press 'SPACE' to play again", playGame));
};


var isFloating = function (sprite) {
  return (sprite == 'shortTrunk' || sprite == 'longTrunk' || sprite == 'medTrunk' || sprite == 'turtle');
};

// Indica que se llame al método de inicialización una vez
// se haya terminado de cargar la página HTML
// y este después de realizar la inicialización llamará a
// startGame
window.addEventListener("load", function () { Game.initialize("game", sprites, startGame); });