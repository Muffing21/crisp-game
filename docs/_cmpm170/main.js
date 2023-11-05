title = "CMPM170";

description = `
[Click]
`;

characters = [
];

options = {};

let player;

class Player {
  position;
  velocity;
  jumping;

  constructor() {
    this.position = vec(25, 75);
    this.velocity = vec(0, 0);
    this.jumping = false;
  }

  update() {
    box(this.position, 10);

    if (this.jumping && this.position.y >= 75) {
      this.jumping = false;
      this.velocity = vec(this.velocity.x, 0);
    }

    if (!this.jumping && input.isJustPressed) {
      this.velocity.add(vec(0, -2));
      play("jump");
      this.jumping = true;
    }

    this.position.add(this.velocity);

    if (this.position.y < 75) {
      this.velocity.add(vec(0, 0.1))
    } else if (this.position.y > 75) {
      this.velocity = vec(this.velocity.x, 0);
      this.position = vec(this.position.x, 75);
    }
  }
}

class Obstacle {
  position;
  constructor() {
    this.position = vec(120, 75);
    if (this.constructor == Obstacle) {
      throw new Error("Abstract Obstacle class must have an implementation.");
    }
  }
  // Should return collision info.
  update() {
    this.position.sub(vec(1, 0));

  }
}

class PlayerGravitySwitch extends Player {
  switchUpdate() {
    // Get rid of any floating points for smooth movement:
    this.position = vec(this.position.x, round(this.position.y));
    if (this.desiredPosY == undefined) {
      if (this.jumping) {
        this.desiredPosY = 35;
      } else {
        this.desiredPosY = 75;
      }
    }
    if (this.position.y != this.desiredPosY) {
      let diff = Math.sign(this.desiredPosY - this.position.y);
      this.position.add(0, diff);
    }
    if (input.isJustPressed) {
      if (this.desiredPosY == 75) {
        this.desiredPosY = 35;
      } else {
        this.desiredPosY = 75;
      }
    }
    box(this.position, 10);
  }
}

class GravitySwitcher extends Obstacle {
  triggered = false;
  inert = false;
  width = 100;
  constructor() {
    super();
    this.position.add(this.width, 0);
  }
  update() {
    super.update();
    if (!this.triggered && player.position.x >= this.position.x - this.width/2) {
      player.update = PlayerGravitySwitch.prototype.switchUpdate;
      this.triggered = true;
    }
    if (!this.inert && player.position.x >= this.position.x + this.width/2) {
      this.inert = true;
      player.update = Player.prototype.update;
      player.velocity = vec(player.velocity.x, 0);
    }

    box(this.position.x, 85, this.width, 10);
    box(this.position.x, 25, this.width, 10);
  }
}

let obstacleSpawnTimer;

let obstaclesToSpawn = [GravitySwitcher];
let obstacles = [];

function update() {
  if (!ticks) {
    player = new Player();
    obstacleSpawnTimer = -400;
  }

  if (ticks - obstacleSpawnTimer > 400) {
    obstacles.push(new obstaclesToSpawn[rndi(0, obstaclesToSpawn.length)]());
    obstacleSpawnTimer = ticks;
  }
  player.update();
  obstacles.forEach((o) => {
    o.update();
  });
}