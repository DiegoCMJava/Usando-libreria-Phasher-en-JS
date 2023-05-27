// =============================================================================
// sprites
// =============================================================================

//
// sprite heroe
//
function Hero(game, x, y) {
  // llamar al constructor Phaser.Sprite
  Phaser.Sprite.call(this, game, x, y, 'hero');
  this.anchor.set(0.5, 0.5);

  // propiedades de la física
  this.game.physics.enable(this);
  this.body.collideWorldBounds = true;

  this.animations.add('stop', [0]);
  this.animations.add('run', [1, 2], 8, true);
  this.animations.add('jump', [3]);
  this.animations.add('fall', [4]);

  this.animations.add('die', [5, 6, 5, 6, 5, 6, 5, 6], 12);
  this.animations.play('stop');

};

// heredando de Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
  if (this.isFrozen) {
    return;
  };
  const SPEED = 200;
  this.body.velocity.x = direction * SPEED;

  if (this.body.velocity.x < 0) {
    this.scale.x = -1;
  } else if (this.body.velocity.x > 0) {
    this.scale.x = 1;
  }
};

Hero.prototype.jump = function () {
  const JUMP_SPEED = 600;
  let canJump = this.body.touching.down && this.alive && !this.isFrozen;

  if (canJump || this.isBoosting) {
    this.body.velocity.y = -JUMP_SPEED;
    this.isBoosting = true;
  }
  return canJump;
};

Hero.prototype.stopJumpBoost = function(){
this.isBoosting = false;
};

Hero.prototype.bounce = function () {
  const BOUNCE_SPEED = 200;
  this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.update = function () {
  let animationName = this._getAnimationName();
  if (this.animations.name !== animationName) {
    this.animations.play(animationName);
  }
};

Hero.prototype.freeze = function(){
 this.body.enable = false;
 this.isFrozen = true;
};

Hero.prototype.die = function(){
  this.alive = false;
  this.body.enable = false;

  this.animations.play('die').onComplete.addOnce(function(){
    this.kill();
  }, this);
};

Hero.prototype._getAnimationName = function () {
  let name = 'stop';

  if (!this.alive) {
    name = 'die';
  } else if (this.isFrozen) {
    name = 'stop';
  }

  else if (this.body.velocity.y < 0) {
    name = 'jump';
  } else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
    name = 'fall';
  } else if (this.body.velocity.x !== 0 && this.body.touching.down) {
    name = 'run';
  }
  return name;
};

//
// enemigos
//
function Spider(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'spider');
  this.anchor.set(0.5);

  this.animations.add('crawl', [0, 1, 2], 8, true);
  this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
  this.animations.play('crawl');

  this.game.physics.enable(this);
  this.body.collideWorldBounds = true;
  this.body.velocity.x = Spider.SPEED;
};

Spider.SPEED = 100;

Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
  if (this.body.touching.right || this.body.blocked.right) {
    this.body.velocity.x = -Spider.SPEED;
  } else if (this.body.touching.left || this.body.blocked.left) {

    this.body.velocity.x = Spider.SPEED;
  }
};
Spider.prototype.die = function () {
  this.body.enable = false;

  this.animations.play('die').onComplete.addOnce(function () {
    this.kill();
  }, this);
};

// =============================================================================
// cargando estado
// =============================================================================

LoadingState = {};

LoadingState.init = function(){
  this.game.renderer.renderSession.roundPixels = true;
};

LoadingState.preload = function (){
  this.game.load.json('level:0', 'data/level00.json');
  this.game.load.json('level:1', 'data/level01.json');
  this.game.load.json('level:2', 'data/level02.json');
  this.game.load.json('level:3', 'data/level03.json');

  this.game.load.image('background_1', 'images/background_1.png');
  this.game.load.image('background_2', 'images/background_2.png');
  this.game.load.image('background_3', 'images/background_3.png');
  this.game.load.image('background_4', 'images/background_4.png');

  this.game.load.image('plattform_1', 'images/plattform_1.png');
  this.game.load.image('plattform_2', 'images/plattform_2.png');
  this.game.load.image('plattform_3', 'images/plattform_3.png');
  this.game.load.image('block03', 'images/block03.png');
  this.game.load.image('block04', 'images/block04.png');
  this.game.load.image('block05', 'images/block05.png');
  this.game.load.image('block06', 'images/block06.png');
  this.game.load.image('invisible-wall', 'images/invisible_wall.png');
  this.game.load.image('key', 'images/key.png');

  //this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
  this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
  this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
  this.game.load.spritesheet('door', 'images/door.png', 42, 66);
  this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);

  this.game.load.audio('sfx:jump', 'audio/jump.wav');
  this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
  this.game.load.audio('sfx:key', 'audio/key.wav');
  this.game.load.audio('sfx:door', 'audio/door.wav');
  this.game.load.audio('spaceship', 'audio/spaceship.wav');
};
LoadingState.create = function(){
  this.game.state.start('play', true, false, {level: 0});
};
// =============================================================================
// estados del juego
// =============================================================================

PlayState = {};

const LEVEL_COUNT = 4;

PlayState.init = function (data) {

  this.keys = this.game.input.keyboard.addKeys({
    left: Phaser.KeyCode.LEFT,
    right: Phaser.KeyCode.RIGHT,
    up: Phaser.KeyCode.UP
  });

  this.hasKey = false;
  this.level = (data.level || 0) % LEVEL_COUNT; 
};
PlayState.create = function () {
  this.camera.flash('#000000');
  this.sfx = {
    key: this.game.add.audio('sfx:key'),
    door: this.game.add.audio('sfx:door'),
    jump: this.game.add.audio('sfx:jump'),
    stomp: this.game.add.audio('sfx:stomp')
    // spaceship: this.game.add.audio('sfx:spaceship')
  };

  this.spaceship = this.game.add.audio('spaceship');
  this.spaceship.loopFull();

 switch (this.level) {
  case 0:
    this.game.add.image(0, 0, 'background_1');
    console.log("Este es el primer nivel");
    break;
    case 1:
    this.game.add.image(0, 0, 'background_2');
    console.log("Este es el segundo nivel");
    break;
    case 2:
    this.game.add.image(0, 0, 'background_3');
    console.log("Este es el tercer nivel");
    break;
    case 3:
    this.game.add.image(0, 0, 'background_4');
    console.log("Este es el cuarto nivel");
    break;
  default:
    //this.game.add.image(0, 0, 'background_1');
    console.log("Este es el default");
    break;
 };
 
 // this.game.add.image(0, 0, 'background_1');
  this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
  this._createHud();
};

// crea entidades y set up del mundo aquí


PlayState.update = function () {
  this._handleCollisions();
  this._handleInput();
  this.keyIcon.frame = this.hasKey ? 1 : 0;
};
PlayState.shutdown = function (){
  this.spaceship.stop();
};
PlayState._handleCollisions = function () {
  this.game.physics.arcade.collide(this.hero, this.platforms);
  this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
  this.game.physics.arcade.collide(this.spiders, this.platforms);

  this.game.physics.arcade.overlap(this.hero, this.spiders, this._onHeroVsEnemy, null, this);
  this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey, null, this);
  this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
    function(hero, door){
      return this.hasKey && hero.body.touching.down;
    }, this);

};
PlayState._handleInput = function () {
  if (this.keys.left.isDown) {
    this.hero.move(-1);
  } else if (this.keys.right.isDown) {
    this.hero.move(1);
  }
  else {
    this.hero.move(0);
  }

    const JUMP_HOLD = 200;   
    if (this.keys.up.downDuration(JUMP_HOLD )) {
      let didJump = this.hero.jump();
      if (didJump) {
        this.sfx.jump.play();}
      }
      else {
        this.hero.stopJumpBoost();
      }

};


PlayState._onHeroVsKey = function (hero, key) {
  this.sfx.key.play();
  key.kill();
  this.hasKey = true;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
  if (hero.body.velocity.y > 0) {
    enemy.die();
    hero.bounce();
    this.sfx.stomp.play();
  } else {
    hero.die();
    this.sfx.stomp.play();
    hero.events.onKilled.addOnce(function(){
      this.game.state.restart(true, false, {level: this.level});
    }, this);
    enemy.body.touching = enemy.body.wasTouching;
  }
};

PlayState._onHeroVsDoor = function(hero, door){
  door.frame = 1;
  this.sfx.door.play();
  hero.freeze();
  this.game.add.tween(hero)
  .to({x: this.door.x, alpha: 0}, 500, null, true)
  .onComplete.addOnce(this._goToNextLevel, this);
 
};

PlayState._goToNextLevel = function(){
  this.camera.fade('#000000');
  this.camera.onFadeComplete.addOnce(function(){
    this.game.state.restart(true, false, {level: this.level +1 });
  },this);
};

PlayState._loadLevel = function (data) {
  this.bgDecoration = this.game.add.group();
  this.platforms = this.game.add.group();
  this.spiders = this.game.add.group();
  this.enemyWalls = this.game.add.group();
  this.enemyWalls.visible = false;

  // mostrar todas las plataformas
  data.platforms.forEach(this._spawnPlatform, this);

  // heroe y enemigos
  this._spawnCharacters({ hero: data.hero, spiders: data.spiders });

  this._spawnDoor(data.door.x, data.door.y);
  this._spawnKey(data.key.x, data.key.y);

  const GRAVITY = 600;  // 1200
  this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnCharacters = function (data) {
  data.spiders.forEach(function (spider) {
    let sprite = new Spider(this.game, spider.x, spider.y);
    this.spiders.add(sprite);
  }, this);
  this.hero = new Hero(this.game, data.hero.x, data.hero.y);
  this.game.add.existing(this.hero);
};

PlayState._spawnPlatform = function (platform) {
  let sprite = this.platforms.create(platform.x, platform.y, platform.image);

  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.body.immovable = true;

  this._spawnEnemyWall(platform.x, platform.y, 'left');
  this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};


PlayState._spawnEnemyWall = function (x, y, side) {
  let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
  sprite.anchor.set(side === 'left' ? 1 : 0, 1);
  this.game.physics.enable(sprite);
  sprite.body.immovable = true;
  sprite.body.allowGravity = false;
};

PlayState._spawnKey = function (x, y) {
  this.key = this.bgDecoration.create(x, y, 'key');
  this.key.anchor.set(0.5, 0.5);
  this.game.physics.enable(this.key);
  this.key.body.allowGravity = false;

  this.key.y -= 3;
  this.game.add.tween(this.key)
    .to({ y: this.key.y + 6 }, 800, Phaser.Easing.Sinusoidal.InOut)
    .yoyo(true)
    .loop()
    .start();
};

PlayState._spawnDoor = function (x, y) {
  this.door = this.bgDecoration.create(x, y, 'door');
  this.door.anchor.setTo(0.5, 1);
  this.game.physics.enable(this.door);
  this.door.body.allowGravity = false;
};

PlayState._createHud = function () {
  this.keyIcon = this.game.make.image(0, 19, 'icon:key');
  this.keyIcon.anchor.set(0, 0.5);

  this.hud = this.game.add.group();
  this.hud.add(this.keyIcon);
  this.hud.position.set(100, 5);
};
// =============================================================================
// punto de entrada
// =============================================================================

window.onload = function () {
  let game = new Phaser.Game(871, 560, Phaser.AUTO, 'game');
  game.state.add('play', PlayState);
  game.state.add('loading', LoadingState);
  game.state.start('loading');
};