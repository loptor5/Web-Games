//LEVEL

var level1 = [ //sprite, carril, sentido, start, vel, tiempoAux, tiempoEspera
  ['shortTrunk', 5, -1, 550, 60, 0, 4], 
  ['longTrunk', 1, -1, 550, 50, 0, 6],
  ['medTrunk', 4, 1, -190, 60, 0, 8],
  ['shortTrunk', 3, -1, 550, 85, 0, 6],
  ['turtle', 2, 1, -80, 60, 0, 3],
  ['truck', 1, -1, 550, 70, 0, 7],
  ['blueCar', 2, 1, -100, 120, 10, 5],
  ['yellowCar', 3, 1, -130, 90, 0, 8],
  ['fireCar', 4, 1, -130, 110, 2, 5],
  ['greenCar', 5, 1, -130, 100, 15, 10],
];

//SPAWN

var Spawn = function (callback) {

  this.levelData = [];
  for (var i = 0; i < level1.length; i++) {
    this.levelData.push(Object.create(level1[i]));
  }
  this.t = 0;
  this.callback = callback;

  this.step = function (dt) {
    this.t += dt * 10;

    for (var i = 0; i < this.levelData.length; i++) {
      data = this.levelData[i];
      if (isFloating(data[0])) {
        if (data[5] === 0) {
          data[5] += dt;
          this.board.add(Object.create(new Floating(data[0], data[1], data[2], data[3], data[4])));
          //console.log(data[4] + "velocidad flotante");
        }
      }
      else {
        if (data[5] === 0) {
          data[5] += dt;
          this.board.add(Object.create(new Car(data[0], data[1], data[2], data[3], data[4])));
          //console.log(data[4] + "velocidad coche");
        }
      }

      if (data[5] >= data[6]) {
        data[5] = 0;
      }
      else {
        data[5] += dt;
      }

      this.levelData[i] = data;
    }
  }
  this.draw = function () {}
}

Spawn.prototype = new Sprite();
Spawn.prototype.zIndex = 7;
Spawn.prototype.type = OBJECT_SPAWN;
