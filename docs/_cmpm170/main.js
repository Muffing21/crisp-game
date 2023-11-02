title = "CMPM170";

description = `
[Click]
`;

characters = [];

options = {};

let playerPos;
let playerVel;
let playerRot;
let jumping;
function update() {
  if (!ticks) {
    playerPos = vec(25, 75);
    playerVel = vec(0, 0);
    jumping = false;
  }
  box(playerPos, 10);
  if (jumping && playerPos.y >= 75) {
    jumping = false;
    playerVel = vec(playerVel.x, 0);
  }
  if (!jumping && input.isJustPressed) {
    playerVel.add(vec(0, -2));
    jumping = true;
  }
  playerPos.add(playerVel);
  if (playerPos.y < 75) {
    playerVel.add(vec(0, 0.1))
  }
}
