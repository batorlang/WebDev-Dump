let game;

const gameOptions = {
    // player (cat)
    playerSpeed: 350,
    playerFireDelay: 300,    // ms between automatic shots
    playerLaserSpeed: 700,
    lives: 3,

    // enemies (job applications)
    enemyHP: 3,
    enemySpeed: 25,          // really slow approach
    enemyFireDelay: 3000,    // ms between enemy shots
    enemyLaserSpeed: 220,    // slow lasers
    enemiesFirstWave: 2
};

class PlayGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    preload() {
        this.load.image("player", "player.png");
        this.load.image("enemy", "application.png");
    }

    create() {
        this.physics.resume();
        this.lives = gameOptions.lives;
        this.wave = 0;
        this.invulnerable = false;
        this.isOver = false;

        // generated laser textures
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x00ffff).fillRect(0, 0, 28, 6);
        g.generateTexture("playerLaser", 28, 6);
        g.clear();
        g.fillStyle(0xff3333).fillRect(0, 0, 28, 6);
        g.generateTexture("enemyLaser", 28, 6);
        g.destroy();

        // player spawns on the left, vertically centered
        this.player = this.physics.add.image(120, 360, "player");
        this.player.setDisplaySize(80, 80);
        this.player.body.setCircle(150, 100, 100); // smaller, fairer hitbox
        this.player.setCollideWorldBounds(true);

        // groups
        this.playerLasers = this.physics.add.group();
        this.enemyLasers = this.physics.add.group();
        this.enemies = this.physics.add.group();

        // collisions
        this.physics.add.overlap(this.playerLasers, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyLasers, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

        // the cat constantly shoots at a fixed rate
        this.time.addEvent({
            delay: gameOptions.playerFireDelay,
            loop: true,
            callback: this.playerShoot,
            callbackScope: this
        });

        // enemies shoot back, slowly
        this.time.addEvent({
            delay: gameOptions.enemyFireDelay,
            loop: true,
            callback: this.enemyShoot,
            callbackScope: this
        });

        // input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys("W,A,S,D");

        // UI
        this.livesText = this.add.text(20, 15, "", {
            fontFamily: "monospace", fontSize: "28px", color: "#ffffff"
        }).setDepth(10);
        this.updateUI();

        this.spawnWave();
    }

    update() {
        if (this.isOver) return;

        // movement: arrow keys / WASD, or hold mouse/touch to move toward the pointer
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.keys.A.isDown) vx -= 1;
        if (this.cursors.right.isDown || this.keys.D.isDown) vx += 1;
        if (this.cursors.up.isDown || this.keys.W.isDown) vy -= 1;
        if (this.cursors.down.isDown || this.keys.S.isDown) vy += 1;

        const pointer = this.input.activePointer;
        if (vx === 0 && vy === 0 && pointer.isDown) {
            const dx = pointer.worldX - this.player.x;
            const dy = pointer.worldY - this.player.y;
            if (Math.hypot(dx, dy) > 10) {
                vx = dx;
                vy = dy;
            }
        }

        const v = new Phaser.Math.Vector2(vx, vy);
        if (v.lengthSq() > 0) v.normalize().scale(gameOptions.playerSpeed);
        this.player.setVelocity(v.x, v.y);

        // enemies slowly drift toward the player
        this.enemies.getChildren().forEach(e => {
            this.physics.moveToObject(e, this.player, gameOptions.enemySpeed);
        });

        // clean up lasers that left the screen
        this.playerLasers.getChildren().slice().forEach(l => { if (l.x > 1300) l.destroy(); });
        this.enemyLasers.getChildren().slice().forEach(l => {
            if (l.x < -40 || l.x > 1320 || l.y < -40 || l.y > 760) l.destroy();
        });
    }

    spawnWave() {
        this.wave++;
        const count = gameOptions.enemiesFirstWave + this.wave - 1;
        for (let i = 0; i < count; i++) {
            const y = 720 * (i + 1) / (count + 1);
            const e = this.enemies.create(1180 + Phaser.Math.Between(0, 60), y, "enemy");
            e.setDisplaySize(90, 120);
            e.setData("hp", gameOptions.enemyHP);
        }
    }

    playerShoot() {
        if (this.isOver) return;
        const l = this.playerLasers.create(this.player.x + 45, this.player.y, "playerLaser");
        l.setVelocityX(gameOptions.playerLaserSpeed);
    }

    enemyShoot() {
        if (this.isOver) return;
        this.enemies.getChildren().forEach(e => {
            const l = this.enemyLasers.create(e.x - 50, e.y, "enemyLaser");
            const angle = Phaser.Math.Angle.Between(l.x, l.y, this.player.x, this.player.y);
            l.setRotation(angle);
            this.physics.velocityFromRotation(angle, gameOptions.enemyLaserSpeed, l.body.velocity);
        });
    }

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

    hitPlayer(player, other) {
        // lasers vanish on hit; enemies stay
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

    updateUI() {
        this.livesText.setText("Lives: " + this.lives);
    }

    endGame() {
        this.isOver = true;
        this.physics.pause();
        this.add.text(640, 320, "GAME OVER", {
            fontFamily: "monospace", fontSize: "64px", color: "#ff5555"
        }).setOrigin(0.5).setDepth(10);
        this.add.text(640, 400, "Press R or tap to restart", {
            fontFamily: "monospace", fontSize: "26px", color: "#ffffff"
        }).setOrigin(0.5).setDepth(10);

        this.input.keyboard.once("keydown-R", () => this.scene.restart());
        this.time.delayedCall(400, () => {
            this.input.once("pointerdown", () => this.scene.restart());
        });
    }
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
};