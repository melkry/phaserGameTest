import Phaser from "phaser";
import { enterDialogue } from "./components/dialogue/dialogueBox";
let gameState = {
  active: true,
  collidingData: {
    isColliding: false,
    collidingWith: null,
    dialogueName: null
  }
};

export default class SceneMain extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {
    // load in tilesheet
    this.load.image(
      "tiles",
      "../assets/tilesets/tuxmon-sample-32px-extruded.png"
    );
    this.load.tilemapTiledJSON("map", "../assets/tilesets/tuxmon-town.json");
    this.load.spritesheet("ash", "../assets/sprites/ash.png", {
      frameWidth: 55,
      frameHeight: 58,
      endFrame: 16
    });
    this.load.spritesheet("cat", "../assets/sprites/cats.png", {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.image("dialogue-box", "../assets/dialogue-box.png");
  }

  create() {
    // add active property so we can pause progression for dialogue etc..
    gameState.active = true;

    const map = this.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    // set the appropriate layer with collisions (ensures player doesn't walk into them)
    // the collisions can be set in Tiled before exporting
    worldLayer.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(1);

    /* //Use this code to view where collisions are (for debugging purposes)
    const debugGraphics = this.add.graphics().setAlpha(0.75);

    worldLayer.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });*/

    // adding cursors for player movement
    gameState.cursors = this.input.keyboard.createCursorKeys();
    gameState.WASD = this.input.keyboard.addKeys("W,S,A,D"); // gameState.WASD.W, gameState.WASD.S, gameState.WASD.A, gameState.WASD.D

    // add in player
    gameState.player = this.physics.add.sprite(200, 300, "ash");

    // create player animations from spritesheet
    this.anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers("ash", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: "walk-up",
      frames: this.anims.generateFrameNumbers("ash", { start: 12, end: 15 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: "walk-right-left",
      frames: this.anims.generateFrameNumbers("ash", { start: 4, end: 7 }),
      frameRate: 6,
      repeat: -1
    });

    // add collisions to gamestate player

    this.physics.add.collider(gameState.player, worldLayer);

    // make the camera follow the player
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(gameState.player);

    // function to create dialogue box with text and author

    // adding cat sprites, animations, tween
    gameState.cat = this.physics.add.sprite(300, 400, "cat");
    this.anims.create({
      key: "cat-walk-right",
      frames: this.anims.generateFrameNumbers("cat", { start: 24, end: 26 }),
      frameRate: 6,
      repeat: -1
    });

    gameState.cat.anims.play("cat-walk-right", true);

    gameState.cat.move = this.tweens.add({
      targets: gameState.cat,
      x: 800,
      ease: "Linear",
      duration: 3000,
      repeat: -1,
      yoyo: true,
      onYoyo: function () {
        gameState.cat.flipX = true;
      },
      onRepeat: function () {
        gameState.cat.flipX = false;
      }
    });

    // add collision between player and cat
    this.physics.add.overlap(gameState.player, gameState.cat, () => {
      gameState.collidingData.isColliding = true;
      gameState.collidingData.collidingWith = gameState.cat;
      gameState.collidingData.dialogueName = "cat_one";
    });

    // add action key functionality (enter)
    gameState.enterKey = this.input.keyboard.addKey("ENTER");
  }

  update() {
    // add walking functionality (test if arrow keys are down)
    if (gameState.active) {
      if (gameState.cursors.down.isDown || gameState.WASD.S.isDown) {
        gameState.player.setVelocityX(0);
        gameState.player.setVelocityY(150);
        gameState.player.anims.play("walk-down", true);
        gameState.player.flipX = false;
      } else if (gameState.cursors.up.isDown || gameState.WASD.W.isDown) {
        gameState.player.setVelocityX(0);
        gameState.player.setVelocityY(-150);
        gameState.player.anims.play("walk-up", true);
        gameState.player.flipX = false;
      } else if (gameState.cursors.left.isDown || gameState.WASD.A.isDown) {
        gameState.player.setVelocityY(0);
        gameState.player.setVelocityX(-150);
        gameState.player.anims.play("walk-right-left", true);
        gameState.player.flipX = false;
      } else if (gameState.cursors.right.isDown || gameState.WASD.D.isDown) {
        gameState.player.setVelocityY(0);
        gameState.player.setVelocityX(150);
        gameState.player.anims.play("walk-right-left", true);
        gameState.player.flipX = true;
      } else {
        gameState.player.setVelocityY(0);
        gameState.player.setVelocityX(0);
        gameState.player.anims.pause();
      }
    } else {
      gameState.player.setVelocityY(0);
      gameState.player.setVelocityX(0);
      this.anims.pauseAll();
      this.physics.pause();
      gameState.cat.move.pause();
    }

    if (gameState.collidingData.isColliding) {
      if (gameState.enterKey.isDown) {
        enterDialogue(this, gameState, gameState.collidingData.dialogueName);
      }
      gameState.collidingData.collidingWith.move.pause();
      gameState.collidingData.collidingWith.anims.pause();
    } else if (gameState.collidingData.collidingWith && gameState.active) {
      gameState.collidingData.collidingWith.move.resume();
      gameState.collidingData.collidingWith.anims.resume();
    }

    gameState.collidingData.isColliding = false;
  }
}
