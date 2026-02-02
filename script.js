const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- DOM elements ---
const gameOverPopup = document.getElementById("gameOverPopup");
const finalScoreEl = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

// --- CANVAS RESIZE ---
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  player.groundY = canvas.height - player.height - 40;
  player.y = player.groundY;

  obstacles.forEach(o => o.y = canvas.height - o.height - 40);
}

window.addEventListener("resize", resizeCanvas);

// --- LOAD IMAGES ---
const playerImg = new Image();
playerImg.src = "player.png";

const obstacleImg = new Image();
obstacleImg.src = "obstacle.png";

const backgroundImg = new Image();
backgroundImg.src = "background.jpg";

// --- PLAYER ---
const player = {
  x: 50,
  y: 0,
  width: 120,
  height: 120,
  velocityY: 0,
  gravity: 0.9,      // for longer jump
  jumpStrength: 30,  // high jump
  isJumping: false,
  groundY: 0,
  img: playerImg
};

// --- OBSTACLES ---
let obstacles = [];
const obstacleFrequency = 1500;
let lastObstacleTime = 0;

// --- SCORE ---
let score = 0;

// --- JUMP SOUNDS ---
const jumpSounds = [
  new Audio("jump1.mp3"),
  new Audio("jump2.mp3"),
  new Audio("jump3.mp3")
];
let jumpSoundIndex = 0;

// --- JUMP FUNCTION ---
function jump() {
  if (!player.isJumping) {
    player.velocityY = -player.jumpStrength;
    player.isJumping = true;

    jumpSounds[jumpSoundIndex].currentTime = 0;
    jumpSounds[jumpSoundIndex].play();
    jumpSoundIndex = (jumpSoundIndex + 1) % jumpSounds.length;
  }
}

// --- EVENTS ---
document.addEventListener("touchstart", jump);
document.addEventListener("click", jump);

// --- CREATE OBSTACLE ---
function createObstacle() {
  const obsWidth = 120;
  const obsHeight = 120;
  obstacles.push({
    x: canvas.width,
    y: canvas.height - obsHeight - 40,
    width: obsWidth,
    height: obsHeight,
    speed: 5
  });
}

// --- SHOW GAME OVER POPUP ---
function showGameOver() {
  finalScoreEl.innerText = "Score: " + score;
  gameOverPopup.style.display = "flex";
}

// --- RESTART GAME ---
restartBtn.addEventListener("click", () => {
  obstacles = [];
  score = 0;
  player.y = player.groundY;
  player.velocityY = 0;
  player.isJumping = false;
  gameOverPopup.style.display = "none";
});

// --- GAME LOOP ---
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- STATIC BACKGROUND ---
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  // --- PLAYER PHYSICS ---
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  if (player.y >= player.groundY) {
    player.y = player.groundY;
    player.velocityY = 0;
    player.isJumping = false;
  }

  // --- DRAW PLAYER ---
  ctx.drawImage(player.img, player.x, player.y, player.width, player.height);

  // --- OBSTACLES ---
  obstacles.forEach((obs, i) => {
    obs.x -= obs.speed;
    ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);

    // Collision detection
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      showGameOver(); // <-- custom notification
    }

    if (obs.x + obs.width < 0) obstacles.splice(i, 1);
  });

  // --- SCORE ---
  score++;
  document.getElementById("score").innerText = "Score: " + score;
}

function gameLoop(timestamp) {
  if (timestamp - lastObstacleTime > obstacleFrequency) {
    createObstacle();
    lastObstacleTime = timestamp;
  }

  update();
  requestAnimationFrame(gameLoop);
}

// --- INITIALIZE ---
window.onload = () => {
  resizeCanvas();
  requestAnimationFrame(gameLoop);
};
