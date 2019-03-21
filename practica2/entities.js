
var sprites = {
  background: { sx: 422, sy: 0, w: 550, h: 625, frame: 1 },
  froggerLogo: { sx: 0, sy: 392, w: 272, h: 167, frame: 1 },
  frog: { sx: 0, sy: 343, w: 38, h: 40, frame: 1 },
  blueCar: { sx: 8, sy: 7, w: 90, h: 46, frame: 1 },
  yellowCar: { sx: 213, sy: 5, w: 94, h: 48, frame: 1 },
  greenCar: { sx: 109, sy: 6, w: 94, h: 48, frame: 1 },
  truck: { sx: 148, sy: 61, w: 200, h: 48, frame: 1 },
  fireCar: { sx: 7, sy: 61, w: 124, h: 46, frame: 1 },
  medTrunk: { sx: 10, sy: 121, w: 191, h: 46, frame: 1 },
  shortTrunk: { sx: 271, sy: 170, w: 129, h: 46, frame: 1 },
  longTrunk: { sx: 10, sy: 169, w: 248, h: 46, frames: 1 },
  turtle: { sx: 336, sy: 341, w: 49, h: 48, frame: 1 },
  water: { sx: 421, sy: 49, w: 587, h: 240, frame: 1 },
  grass: { sx: 422, sy: 0, w: 550, h: 46, frame: 1 },
  death: { sx: 212, sy: 128, w: 47, h: 35, frames: 4 }
};


var OBJECT_PLAYER = 1,
    OBJECT_SURFACE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_WATER = 8,
    OBJECT_GRASS = 16,
    OBJECT_BACKGROUND = 32,
    OBJECT_SPAWN = 64;


/// CLASE PADRE SPRITE

var Sprite = function () { }

Sprite.prototype.setup = function (sprite, props) {
  this.sprite = sprite;
  this.merge(props);
  this.frame = this.frame || 0;
  this.w = SpriteSheet.map[sprite].w;
  this.h = SpriteSheet.map[sprite].h;
}

Sprite.prototype.merge = function (props) {
  if (props) {
    for (var prop in props) {
      this[prop] = props[prop];
    }
  }
}

Sprite.prototype.draw = function (ctx) {
  SpriteSheet.draw(ctx, this.sprite, this.x, this.y, this.frame);
}

Sprite.prototype.hit = function (damage) {
  this.board.remove(this);
}


// PLAYER

var PlayerFrog = function () {

  this.setup('frog', { vx: 0, frame: 0, reloadTime: 0.25 });
  
  this.vx = 0;
  this.x = Math.floor((Game.width / 40) / 2 + 240);
  this.y = Game.height - this.h;

  this.reload = this.reloadTime;

  this.step = function (dt) {

    if (Game.keys['left']) {
      this.x -= 40 - this.vx * dt;
    }
    else if (Game.keys['right']) {
      this.x += 40 + this.vx * dt;
    }
    else if (Game.keys['up']) {
      this.y -= 48
    }
    else if (Game.keys['down']) {
      this.y += 48
    }

    this.x += this.vx * dt;

    if (this.x < 0) {
      this.x = 0;
    }
    else if (this.x > Game.width - this.w) {
      this.x = Game.width - this.w
    }
    else if (this.y < 0) {
      this.y = 0;
    }
    else if (this.y > Game.height - this.h) {
      this.y = Game.height - this.h;
    }

    Game.keys = {}; // reseteamos las teclas

    if (this.board.collide(this, OBJECT_WATER) && !this.board.collide(this, OBJECT_SURFACE)) { // si cae al agua sin tronco
      this.board.remove(this);
      this.board.add(new Death(this.x, this.y));
      loseGame();
    }

    this.vx = 0;
  }

  this.floating = function (vt) { // se pone a la velocidad del objeto en el agua
    this.vx = vt;
  }

}

PlayerFrog.prototype = new Sprite();
PlayerFrog.prototype.type = OBJECT_PLAYER;
PlayerFrog.prototype.zIndex = 1;
PlayerFrog.prototype.hit = function (damage) {};


//CAR

var Car = function (tipo, carril, dir, startPos, vel) {

  this.y = 289 + 48 * carril;
  this.x = startPos;

  this.setup(tipo, { vx: vel, frame: 0, reloadTime: 0.10, maxVel: 0 });
  this.step = function (dt) {
    this.x += this.vx * dt * dir;
    if (this.x < 0 - Game.width) {
      this.board.remove(this);
    }
    var collCar = this.board.collide(this, OBJECT_PLAYER);
    if (collCar) {
      this.board.remove(collCar);
      this.board.add(new Death(collCar.x, collCar.y));
      loseGame();
    }
  }
}

Car.prototype = new Sprite();
Car.prototype.type = OBJECT_ENEMY;
Car.prototype.zIndex = 4;
Car.prototype.hit = function (damage) {};


//FLOATING

var Floating = function (tipo, carril, dir, startPos, vel) {
  this.y = 49 * carril;
  this.x = startPos;
  this.setup(tipo, { vx: vel, frame: 0, reloadTime: 0.10, maxVel: 0 });
  this.step = function (dt) {
    this.x += this.vx * dt * dir;
    if (this.x < 0 - Game.width) { // Si se sale del tablero se elimina
      this.board.remove(this);
    }

    if (this.board.collide(this, OBJECT_PLAYER)) { // Si colisiona flota
      this.board.collide(this, OBJECT_PLAYER).floating(this.vx * dir);
    }
  }
}

Floating.prototype = new Sprite();
Floating.prototype.type = OBJECT_SURFACE;
Floating.prototype.zIndex = 3;
Floating.prototype.hit = function (damage) {}


//GRASS

var Grass = function () {
  this.x = 0;
  this.y = 0;
  this.setup("grass", { vx: 0, frame: 0 });
  this.step = function (dt) {
    if (this.board.collide(this, OBJECT_PLAYER)) { // Si colisiona con la hierva gana
      this.board.remove(this.board.collide(this, OBJECT_PLAYER));
      winGame();
    }
  }
  this.draw = function () { };
}
Grass.prototype = new Sprite();
Grass.prototype.type = OBJECT_GRASS;
Grass.prototype.zIndex = 5;


//DEATH

var Death = function (centerX, centerY) {
  this.setup("death", { frame: 0 });
  this.x = centerX;
  this.y = centerY;
  this.subFrame = 0;
};

Death.prototype = new Sprite();
Death.prototype.zIndex = 2;

Death.prototype.step = function (dt) {
  this.frame = Math.floor(this.subFrame++ / 16);
  if (this.subFrame >= 16 * 4) {
    this.board.remove(this);
  }
};


//WATER

var Water = function () {
  this.x = 0;
  this.y = 49;
  this.setup("water", { vx: 40, frame: 0, reloadTime: 0.10, maxVel: 0 });
  this.step = function (dt) {
  }
  this.draw = function () { };
}
Water.prototype = new Sprite();
Water.prototype.type = OBJECT_WATER;
Water.prototype.zIndex = 6;


//BACKGROUND

var Background = function () {
  this.setup('background', { frame: 0 });
  this.x = 0;
  this.y = 0;
  this.step = function (dt) {}
}

Background.prototype = new Sprite();
Background.prototype.type = OBJECT_BACKGROUND;


//FROGGER LOGO

var froggerLogo = function () {
  this.setup('froggerLogo', { frame: 0 });
  this.x = 150;
  this.y = 80;
  this.step = function (dt) {}
}

froggerLogo.prototype = new Sprite();
froggerLogo.prototype.type = OBJECT_BACKGROUND;
froggerLogo.prototype.zIndex = 8;