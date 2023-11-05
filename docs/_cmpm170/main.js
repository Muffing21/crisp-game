title = "CMPM170";

description = `
[Click]
`;

characters = [
];

options = {};

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

class GravitySwitcher extends Obstacle {
  constructor() {
    super();
  }
  update() {
    super.update();
    return box(this.position, 10);
  }
}

let player;
let obstacleSpawnTimer;

let obstaclesToSpawn = [GravitySwitcher];
let obstacles = [];
function update() {
  if (!ticks) {
    player = new Player();
    obstacleSpawnTimer = 0;
  }

  if (ticks - obstacleSpawnTimer > 100) {
    obstacles.push(new obstaclesToSpawn[rndi(0, obstaclesToSpawn.length)]());
    obstacleSpawnTimer = ticks;
  }
  player.update();
  obstacles.forEach((o) => {
    o.update();
  });
}