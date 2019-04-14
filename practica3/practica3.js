window.addEventListener('load', function () {


    // Set up an instance of the Quintus engine and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the `TileLayer` class as well as the `2d` componet.
    var Q = window.Q = Quintus({ audioSupporter: ["mp3", "ogg"] })
        .include("Sprites, Scenes, Input, 2D, Anim, Audio, Touch, UI, TMX")
        // Maximize this game to whatever the size of the browser is
        .setup({ 
            //width: 320, // width of created canvas
            //height: 420, // height of created canvas
            maximize: true
            })
        // And turn on default input controls and touch input (for UI)
        .controls().touch()
        .enableSound();

    Q.state.set({
        score: 0
    });

    // ESCENAS

    Q.scene('endGame', function (stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2,
            y: Q.height / 2,
            fill: "rgba(0,0,0,0.5)"
        }));
        var button = container.insert(new Q.UI.Button({
            x: 0,
            y: 0,
            fill: "#CCCCCC",
            label: "Play Again"
        }))
        var label = container.insert(new Q.UI.Text({
            x: 10,
            y: -10 - button.p.h,
            label: stage.options.label
        }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click", function () {
            Q.audio.stop();
            Q.clearStages();
            Q.stageScene('mainTitle');
        });
        container.fit(20);
    });


    Q.scene("mainTitle", function (stage) {

        stage.insert(new Q.Repeater({
            asset: "mainTitle.png"
        }));

        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2,
            y: Q.height * 2 / 3,
            fill: "rgba(0,0,0,0.5)"
        }));

        var button = container.insert(new Q.UI.Button({
            x: 0,
            y: 0,
            fill: "#CCCCCC",
            label: "Play"
        }))

        button.on("click", function () {
            Q.clearStages();
            Q.stageScene('level1');
            Q.stageScene("HUD", 3);
        });

        container.fit(20);

        // Restart coins and life
        //Q.state.set("coins",0);
        //Q.state.set("lives",3);

    });

    // JUGADOR

    Q.Sprite.extend("Player", {
        init: function (p) {
            this._super(p, {
                sprite: "player_anim",
                sheet: "marioR",
                direction: "right",
                x: 180,
                y: 430,
                landed: false,
                gravity: 0.7,
                jumpSpeed: -310, // default -300
                contadorJump: 0
            });
            this.add('2d, platformerControls, animation');
            this.on("hit.sprite", function (collision) {
                if (collision.obj.isA("Princess")) {
                    Q.audio.stop("music_main.ogg");
                    Q.audio.play("music_level_complete.ogg");
                    Q.stageScene("endGame", 1, { label: "You Won!" });
                    this.destroy();
                }
            });

        },
        step: function (dt) {
            if (this.p.vy == 0 && this.p.vx == 0 && !this.p.ignoreControls) {
                this.play("stand_" + this.p.direction);
                this.p.contadorJump = 0;
            }
            else if (this.p.landed > 0 && !this.p.ignoreControls) {
                this.play("walk_" + this.p.direction);
                this.p.contadorJump = 0;
            }
            else if (!this.p.ignoreControls) { //duck 
                this.p.contadorJump++;
                this.play("jump_" + this.p.direction);
            }

            if (this.p.contadorJump == 1) {
                Q.audio.play("jump_big.ogg", { loop: false });
            }

            // Comprueba si Mario muere por caida
            if (this.p.y > 591) {
                this.p.vy = -100;
                this.play("dead_" + this.p.direction);
                //this.del('2d, platformerControls');
                Q.audio.stop(); // Everything will stop playing
                Q.audio.play('music_die.ogg'); // Play the lose music
                Q.stageScene("endGame", 1, { label: "You Lose..." });
                this.destroy();
            }
        },
        win: function () {
            this.del('2d, platformerControls');
            Q.audio.stop(); // Everything will stop playing
            Q.audio.play('music_level_complete.ogg'); // Play the win music
            Q.stageScene("endGame", 1, { label: "You Won!" });
        }
    });

    // PRINCESA

    Q.Sprite.extend("Princess", {

        init: function (p) {
            this._super(p, {
                asset: "princess.png"
            });

            this.add('2d');

            this.on("hit.sprite", this, "hit");
        },

        hit: function (col) {
            if (col.obj.isA("Player")) {
                col.obj.trigger('win');
            }
        }

    });

    // GOOMBA

    Q.Sprite.extend("Goomba", {
        init: function (p) {
            this._super(p, {
                sprite: "goomba_animations",
                sheet: 'goomba',
                vx: -20
            });
            // Enemies use the Bounce AI to change direction
            // whenver they run into something.
            this.add('2d, aiBounce, animation');
            // Listen for a sprite collision, if it's the player,
            // end the game unless the enemy is hit on top
            this.on("bump.left,bump.right,bump.bottom", function (collision) {
                if (collision.obj.isA("Player")) {
                    this.p.vy = -100;
                    this.play("dead_" + this.p.direction);
                    Q.audio.stop(); // Everything will stop playing
                    Q.audio.play('music_die.ogg'); // Play the lose music
                    Q.stageScene("endGame", 1, { label: "You Lose..." });
                    collision.obj.destroy();
                }
            });
            // If the enemy gets hit on the top, destroy it
            // and give the user a "hop"
            this.on("bump.top", function (collision) {
                if (collision.obj.isA("Player")) {
                    Q.audio.play("hit_head.ogg");
                    Q.state.inc("score", 10);
                    collision.obj.p.vy = -300;
                    this.destroy();
                }
            });
        },
        step: function (dt) {
            if (this.p.vx != 0) {
                this.play("walk", 1);
            }
        }
    });

    // BLOOPA

    Q.Sprite.extend("Bloopa", {
        init: function (p) {
            this._super(p, {
                sheet: "bloopa",
                sprite: "bloopa_anim",
                vx: 0,
                gravity: 0.2,
                jumpTimer: 0
            });
            // Enemies use the Bounce AI to change direction
            // whenver they run into something.
            this.add('2d, aiBounce, animation');
            // Listen for a sprite collision, if it's the player,
            // end the game unless the enemy is hit on top
            this.on("bump.left,bump.right,bump.bottom", function (collision) {
                if (collision.obj.isA("Player")) {
                    this.p.vy = -100;
                    this.play("dead_" + this.p.direction);
                    Q.audio.stop(); // Everything will stop playing
                    Q.audio.play('music_die.ogg'); // Play the lose music
                    Q.stageScene("endGame", 1, { label: "You Lose..." });
                    collision.obj.destroy();
                }
                if (collision.obj.isA("level1")) {
                    this.p.vy = -300;
                }
            });
            // If the enemy gets hit on the top, destroy it
            // and give the user a "hop"
            this.on("bump.top", function (collision) {
                if (collision.obj.isA("Player")) {
                    Q.audio.play("hit_head.ogg");
                    Q.state.inc("score", 20);
                    collision.obj.p.vy = -300;
                    this.destroy();
                }
            });

            this.on("bloopa.jumped", this, "jumped");
        },
        step: function (dt) {
            //when step into the floor, stop the X movement
            if (this.p.vy == 0)
                this.p.vx = 0;

            this.p.jumpTimer = this.p.jumpTimer + dt;
            if (this.p.jumpTimer > 4) {
                this.play("jump", 1);
                this.p.jumpTimer = 0;
                this.jumped();
            }
            if (this.p.vy == 0) {
                this.play("stand", 1);
            }
        },
        jumped: function () {
            this.p.vy = -175;
            this.play("stand", 1);
        }
    });

    // SCORE

    Q.UI.Text.extend("Score", {
        init: function (p) {
            this._super({
                label: "score: 0",
                x: Q.Player.x,
                y: Q.Player.y
            });
            Q.state.on("change.score", this, "score");
        },
        score: function (score) {
            this.p.label = "score: " + score;
        }
    });

    // COIN

    Q.Sprite.extend("Coin", {
        init: function(p) {
            this._super(p, {
                sheet: "coin",
                z: -1,
                hit: false,
                angle: 0,
                sensor: true,
                frame: 0
            });

            this.add("tween");

            this.on("hit", function(collision) {
                if (collision.obj.isA("Player") && !this.p.hit) {
                    this.p.hit = true;
                    Q.state.inc("points", 50);
                    Q.audio.play("coin.ogg");
                    this.animate({
                        y: this.p.y - 50,
                        angle: 360
                    }, 0.3, Q.Easing.Linear, {
                        callback: function() {
                            this.destroy();
                        }
                    });
                }
            });
        }
    });


    /*---------
    ANIMACIONES
    ---------*/

    Q.animations("goomba_animations", {
        walk: { frames: [0, 1], rate: 2 / 3, loop: true },
        die: { frames: [0], rate: 0.1, flip: false, loop: false }
    });


    Q.animations("bloopa_anim", {
        stand: { frames: [0], rate: 1 },
        jump: { frames: [1], rate: 1 / 4, loop: false, trigger: "bloopa.jumped" },
        die: { frames: [1], rate: 3, loop: false, trigger: "destroy" }
    });


    Q.animations("player_anim", {
        stand_right: { frames: [0], rate: 1, flip: false },
        stand_left: { frames: [0], rate: 1, flip: "x" },
        walk_right: { frames: [1, 2], rate: 0.1, flip: false, loop: false, next: 'stand_right' },
        walk_left: { frames: [1, 2], rate: 0.1, flip: 'x', loop: false, next: 'stand_left' },
        marioJumpR: { frames: [0], rate: 0.1, flip: false },
        jump_right: { frames: [4], rate: 0.5, flip: false },
        jump_left: { frames: [4], rate: 0.5, flip: "x" },
        dead_right: { frames: [12], rate: 1, flip: false },
        dead_left: { frames: [12], rate: 1, flip: 'x' },
    });

    /*---------------
    CARGA DE FICHEROS
    ---------------*/

    Q.load(["level.tmx", "bg.png", "tiles.png", "mario_small.png", "mario_small.json", "goomba.png", "goomba.json", "bloopa.png", "bloopa.json", "princess.png", "coin.png", "coin.json", "mainTitle.png", "music_main.ogg", "music_level_complete.ogg", "jump_big.ogg", "coin.ogg", "hit_head.ogg", "music_die.ogg"], function () {

        // Compilado de sheets
        Q.compileSheets("mario_small.png", "mario_small.json");
        Q.compileSheets("goomba.png", "goomba.json");
        Q.compileSheets("bloopa.png", "bloopa.json");
        Q.compileSheets("princess.png", "coin.json");
        Q.compileSheets("coin.png", "coin.json");

        /*
        NIVEL 1
        528 base (2 piedras)
        464 muerte
        32x32 casilla
        */
        Q.scene("level1", function (stage) {
            // Reproduce la musica
            Q.audio.play("music_main.ogg", { loop: true });

            // Crea el StageTMX
            Q.stageTMX("level.tmx", stage);

            // Insertamos las entidades
            stage.insert(new Q.Score());

            var player = stage.insert(new Q.Player());
            
            stage.insert(new Q.Coin({
                x: 332,
                y: 464
            }));

            stage.insert(new Q.Coin({
                x: 1210,
                y: 328
            }));

            stage.insert(new Q.Bloopa({
                x: 662,
                y: 528
            }));

            stage.insert(new Q.Goomba({
                x: 694,
                y: 100
            }));

            stage.insert(new Q.Goomba({
                x: 1580,
                y: 494
            }));

            stage.insert(new Q.Goomba({
                x: 254,
                y: 528
            }));

            stage.insert(new Q.Goomba({
                x: 1104,
                y: 528
            }));

            stage.insert(new Q.Princess({
                x: 1922,
                y: 460
            }));

            // Para que la camara siga a Mario
            stage.add("viewport").follow(player, {
                x: true,
                y: false
            });
        });

        // Carga el titulo
        Q.stageScene("mainTitle");
    });
});
