const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- DOM elements ---
const gameOverPopup = document.getElementById("gameOverPopup");
const finalScoreEl = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

// --- GAME STATE ---
let gameRunning = true;

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
  gravity: 1.5,        // proper gravity
  jumpStrength: 30,    // balanced jump
  isJumping: false,
  groundY: 0,
  img: playerImg
};

// --- OBSTACLES ---
let obstacles = [];
const obstacleFrequency = 1800; 
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

// --- CANVAS RESIZE ---
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  player.groundY = canvas.height - player.height - 40;
  player.y = player.groundY;

  obstacles.forEach(o => {
    o.y = canvas.height - o.height - 40;
  });
}
window.addEventListener("resize", resizeCanvas);

// --- JUMP ---
function jump() {
  if (!player.isJumping && gameRunning) {
    player.velocityY = -player.jumpStrength;
    player.isJumping = true;

    // play jump sound one by one
    let sound = jumpSounds[jumpSoundIndex];
    if (sound.paused) {
      sound.currentTime = 0;
      sound.play();
      jumpSoundIndex = (jumpSoundIndex + 1) % jumpSounds.length;
    }
  }
}

// --- CONTROLS ---
document.addEventListener("touchstart", jump);
document.addEventListener("click", jump);
document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

// --- CREATE OBSTACLE ---
function createObstacle() {
  obstacles.push({
    x: canvas.width,
    y: canvas.height - 120 - 40,
    width: 120,
    height: 120,
    speed: 3  // slower obstacle for easier gameplay
  });
}

// --- SHOW GAME OVER ---
function showGameOver() {
  gameRunning = false;
  finalScoreEl.innerText = "Score: " + score;
  gameOverPopup.style.display = "flex";
}

// --- RESTART ---
restartBtn.addEventListener("click", () => {
  obstacles = [];
  score = 0;
  player.y = player.groundY;
  player.velocityY = 0;
  player.isJumping = false;
  gameRunning = true;
  lastObstacleTime = 0;
  gameOverPopup.style.display = "none";
  requestAnimationFrame(gameLoop);
});

// --- UPDATE GAME ---
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  // Player physics
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // --- Ground collision fix ---
  if (player.y >= player.groundY) {
    player.y = player.groundY;
    player.velocityY = 0;
    player.isJumping = false;
  }

  // Draw player
  ctx.drawImage(player.img, player.x, player.y, player.width, player.height);

  // Draw obstacles
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
      showGameOver();
    }

    // Remove obstacles off-screen
    if (obs.x + obs.width < 0) obstacles.splice(i, 1);
  });

  // Score
  score++;
  document.getElementById("score").innerText = "Score: " + score;
}

// --- GAME LOOP ---
function gameLoop(timestamp) {
  if (!gameRunning) return;

  if (timestamp - lastObstacleTime > obstacleFrequency) {
    createObstacle();
    lastObstacleTime = timestamp;
  }

  update();
  requestAnimationFrame(gameLoop);
}

// --- START GAME ---
window.onload = () => {
  resizeCanvas();
  requestAnimationFrame(gameLoop);
};
