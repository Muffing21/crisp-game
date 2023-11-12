title = "CMPM170";

description = `
[Click]
`;

characters = [
`
lllll
 lll
  l
`,
`
  l
 lll
lllll
`,
`
   l
 lll
llll
 lll
   l
`,
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

  offscreen() {
    return false;
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
    } else if (input.isJustPressed) {
      if (this.desiredPosY == 75) {
        this.desiredPosY = 35;
      } else {
        this.desiredPosY = 75;
      }
    }
    if (this.position.y != this.desiredPosY) {
      let diff = Math.sign(this.desiredPosY - this.position.y);
      this.position.add(0, diff);
    }
    box(this.position, 10);
  }
}

class GravitySwitcher extends Obstacle {
  triggered = false;
  inert = false;
  width = 100;

  spikes = [];
  constructor() {
    super();
    this.position.add(this.width, 0);

    let numSpikes = Math.floor(Math.random() * 4) + 2;
    for (var i = 0; i < numSpikes; i++) {
      let bottom = 72;
      if (Math.random() > 0.5) {
        bottom = 35;
      }

      let x = i * this.width/(numSpikes) - this.width/2;
      if (x >= this.width/2) {
        x = this.width/2 + 7;
      } else if (x <= -this.width/2) {
        x = this.width/2 - 7;
      }
      this.spikes.push(vec(x, bottom));
    }
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
      player.desiredPosY = undefined;

      addScore(10);
    }

    color("red");
    box(this.position.x, 85, this.width, 10);
    box(this.position.x, 25, this.width, 10);
    color("black");

    let collision;
    this.spikes.forEach((s) => {
      let newPos = vec(s.x + this.position.x, s.y)
      let charName = "b";
      if (s.y <= 35) {
        charName = "a";
      }
      let c = char(charName, newPos, {
        scale: {
          x: 2,
          y: 5
        }
      });
      if (c.isColliding.rect.black) {
        collision = c;
        return;
      }
    });
    return collision;
  }

  offscreen() {
    return this.position.x + this.width/2 <= 0;
  }
}

class PlayerJumpHold extends Player {
  
  
  HoldUpdate(){
      
    if(input.isJustPressed){
      play("jump");
    }

    if(input.isPressed && this.position.y >= 35){
      this.position.y -= 1;
    }
    else{
      if(this.position.y <= 75){
        this.position.y += 0.5;
      }
    }
    box(this.position, 10);
  }
}

class JetPackObstacle extends Obstacle{
  width = 100;
  height = 60;
  projectiles = []
  triggered = false;
  inert = false;

  constructor(){
    super();
    this.position.add(this.width, 0);

    let numProjectiles = Math.floor(rnd(6, 8));
    for(let i = 0; i < numProjectiles; i++){
      let y = rnd(30, 80);
      let x = i * this.width/(numProjectiles) -this.width/2;
      if(x >= this.width/2){
        x = this.width/2 + 7;
      } else if (x <= -this.width/2){
        x = this.width/2 - 7;
      }
      this.projectiles.push(vec(x, y));

    }
  }


  update(){
    if(!this.triggered && player.position.x >= this.position.x - this.width/2){
      player.update = PlayerJumpHold.prototype.HoldUpdate;
      this.triggered = true;
    }
    if(!this.inert && player.position.x >= this.position.x + this.width/2) {
      this.inert = true;
      player.update = Player.prototype.update;
      player.velocity = vec(player.velocity.x, 0);

      addScore(10);
    }

    color("red");
    box(this.position.x, 85, this.width, 10);
    box(this.position.x, 25, this.width, 10);
    this.position.x -= 1;

    let collision;
    color("black");

    this.projectiles.forEach((p) =>{
      let newPos = vec(p.x + this.position.x, p.y);
      let c = box(newPos, 5);
      if(c.isColliding.rect.black){
        collision = c;
        return;
      }
    });
    return collision;
  }

  offscreen(){
    return this.position.x + this.width/2 <= 0;
  }
}

let obstacleSpawnTimer;

let obstaclesToSpawn = [GravitySwitcher, JetPackObstacle];
let obstacles;

function update() {
  if (!ticks) {
    player = new Player();
    obstacleSpawnTimer = -400;
    obstacles = [];
  }

  if (ticks - obstacleSpawnTimer > 400) {
    obstacles.push(new obstaclesToSpawn[rndi(0, obstaclesToSpawn.length)]());
    obstacleSpawnTimer = ticks;
  }
  player.update();
  remove(obstacles, (o) => {
    if (o.offscreen()) {
      return true;
    }
    let c = o.update();
    if (c && c.isColliding.rect.black) {
      play("hit");
      end("You lose.");
    }
  });
}
