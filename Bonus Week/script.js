let game;

const gameOptions = {
    //Player config
    playerSpeed: 350,
    playerFireDelay: 300, //This is in ms for the automatic shooting functionality
    playerLaserSpeed: 700,
    playerHP: 3,

    //Enemy config
    enemyHP: 3,
    enemySpeed: 50,
    enemyFireDelay: 1500,
    enemyLaserSpeed: 220,
    enemyCounter1: 2 //This is the first wave of the game

}

window.onload = function () {
    const gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: "#000099",
        parent: "game",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1280,
            height: 720
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 0 }
            }
        },
        scene: PlayGame
    };
    game = new Phaser.Game(gameConfig);
    window.focus();
}


class PlayGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }


    preload() {
        this.load.image("player", "assets/player.png");
        this.load.image("enemy", "assets/application.png");
    }

    create() {
        this.physics.resume();
        this.lives = gameOptions.playerHP;
        this.wave = 0;
        this.invulnerable = false;
        this.isOver = false;

        //Player and Enemy lasters
        const g = this.make.graphics({ x:0, y:0, add: false});
        g.fillStyle(0x00ffff).fillRect(0, 0, 28, 6);
        g.generateTexture("playerLaser", 28, 6);
        g.clear();
        g.fillStyle(0xff3333).fillRect(0, 0, 28, 6);
        g.generateTexture("enemyLaser", 28, 6);
        g.destroy();

        //groups
        this.playerLaser = this.physics.add.group();
        this.enemyLaser = this.physics.add.group();
        this.enemies = this.physics.add.group();


        //player spawn
        this.player = this.physics.add.image(120, 360, "player");
        this.player.setDisplaySize(80, 80);
        this.player.body.setCircle(150, 100, 100); //This is the hitbox of the player
        this.player.setCollideWorldBounds(true);

        //collisions (hit functions must be declared)
        this.physics.add.overlap(this.playerLaser, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyLaser, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

        //player constant shooting
        this.time.addEvent({
            delay: gameOptions.playerFireDelay, //Player shoots in a predefined rate in a loop.
            loop: true,
            callback: this.playerShoot,
            callbackScope: this
        });

        //enemy constant shooting
        this.time.addEvent({
            delay: gameOptions.enemyFireDelay, //Enemy shoots in a slower rate, still in a loop.
            loop: true,
            callback: this.enemyShoot,
            callbackScope: this
        });

        //input
        this.keys = this.input.keyboard.addKeys("W,A,S,D");
        
        //UI
        this.livesText = this.add.text(20, 15, "", {
            fontFamily: "monospace", fontSize: "28px", color: "#ffffff"
        }).setDepth(10);
        this.updateUI();
        this.spawnWave();
    }

    update() {
        //game loop
        if (this.isOver) return;

        //movement (WASD)
        let vx =0, vy = 0;
        if (this.keys.W.isDown) vy -= 1;
        if (this.keys.A.isDown) vx -= 1;
        if (this.keys.S.isDown) vy += 1;
        if (this.keys.D.isDown) vx += 1;

        const vector = new Phaser.Math.Vector2(vx, vy);
        if (vector.lengthSq() > 0) vector.normalize().scale(gameOptions.playerSpeed);
        this.player.setVelocity(vector.x, vector.y);


        //enemy moves slowly towards the player
        this.enemies.getChildren().forEach(e => {
            this.physics.moveToObject(e, this.player, gameOptions.enemySpead);
        });

        //laser cleanup could be implemented still

    }

    //waves
    spawnWave() {
        this.wave++;
        this.updateUI();
        const count = gameOptions.enemyCounter1 + this.wave -1;
        for (let i = 0; i < count; i++) {
            const y = 720 * (i + 1) / (count + 1);
            const e = this.enemies.create(1180 + Phaser.Math.Between(0, 60), y, "enemy");
            e.setDisplaySize(90, 120);
            e.setData("hp", gameOptions.enemyHP);
        }
    }


    //playerShooting
    playerShoot() {
        if (this.isOver) return;
        const l = this.playerLaser.create(this.player.x + 45, this.player.y, "playerLaser");
        l.setVelocityX(gameOptions.playerLaserSpeed);
    }

    //enemnyShootingdw
    enemyShoot() {
        if (this.isOver) return;
        this.enemies.getChildren().forEach(e => {
            const l = this.enemyLaser.create(e.x - 50, e.y, "enemyLaser");
            const angle = Phaser.Math.Angle.Between(l.x, l.y, this.player.x, this.player.y);
            l.setRotation(angle);
            this.physics.velocityFromRotation(angle, gameOptions.enemyLaserSpeed, l.body.velocity);
        });
    }

    //hitEnemy
    hitEnemy(laser, enemy) {
        laser.destroy();
        const hp = enemy.getData("hp") - 1;
        enemy.setData("hp", hp);
        enemy.setTint(0xff0000);
        this.time.delayedCall(80, () => { if (enemy.active) enemy.clearTint(); });

        if (hp <= 0) {
            enemy.destroy();
            if (this.enemies.countActive() === 0) {
                this.time.delayedCall(1000, () => { if (!this.isOver) this.spawnWave(); });
            }
        }
    }

    //hitPlayer
    hitPlayer(player, other) {
        //on hit, the lasers disappear
        if (other.texture.key === "enemyLaser") other.destroy();
        if (this.invulnerable) return;
        this.lives--;
        this.updateUI();
        if (this.lives <= 0) {
            this.endGame();
            return;
        }
        this.invulnerable = true;
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 7,
            onComplete: () => {
                this.player.setAlpha(1);
                this.invulnerable = false;
            }
        });
    }


   

    //updateUI
    updateUI() {
        this.livesText.setText("Lives: " + this.lives + "   Wave: " + this.wave);
    }

    //endGame
    endGame() {
        this.isOver = true;
        this.physics.pause();
        this.add.text(640, 320, "GAME OVER", {
            fontFamily: "monospace", fontSize: "64px", color: "#ff5555"
        }).setOrigin(0.5).setDepth(10);
        this.add.text(640, 400, "You have reached wave: " + this.wave, {
            fontFamily: "monospace", fontSize: "64px", color: "#ff5555"
        }).setOrigin(0.5).setDepth(10);
    }
}