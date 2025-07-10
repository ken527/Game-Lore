// Flappy Dragon Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

const GRAVITY = 0.4;
const FLAP = -7;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const DRAGON_SIZE = 40;
const DRAGON_COLOR = '#00ffee';
const BG_COLOR = '#111';
const PIPE_COLOR = '#00aaff';
const GROUND_HEIGHT = 40;

let dragon, pipes, score, highScore, gameOver, animationId;

function resetGame() {
  dragon = {
    x: 80,
    y: canvas.height / 2,
    vy: 0,
    size: DRAGON_SIZE
  };
  pipes = [];
  score = 0;
  gameOver = false;
  if (typeof highScore !== 'number') highScore = 0;
  spawnPipe();
}

function spawnPipe() {
  const top = Math.random() * (canvas.height - PIPE_GAP - GROUND_HEIGHT - 100) + 40;
  pipes.push({
    x: canvas.width,
    top,
    bottom: top + PIPE_GAP
  });
}

function drawDragon() {
  // Draw a simple pixel dragon (body, wings, tail, head)
  ctx.save();
  ctx.translate(dragon.x, dragon.y);
  // Body
  ctx.fillStyle = DRAGON_COLOR;
  ctx.fillRect(-12, -15, 24, 30);
  // Head
  ctx.fillRect(8, -10, 16, 16);
  // Tail
  ctx.fillRect(-20, 0, 8, 8);
  // Wings
  ctx.fillStyle = '#00aaff';
  ctx.fillRect(-18, -18, 16, 6);
  ctx.fillRect(-18, 12, 16, 6);
  ctx.restore();
}

function drawPipes() {
  ctx.fillStyle = PIPE_COLOR;
  pipes.forEach(pipe => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
    // Bottom pipe
    ctx.fillRect(pipe.x, pipe.bottom, PIPE_WIDTH, canvas.height - pipe.bottom - GROUND_HEIGHT);
  });
}

function drawGround() {
  ctx.fillStyle = '#333';
  ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
}

function drawScore() {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 16, 40);
  ctx.textAlign = 'right';
  ctx.fillText('High: ' + highScore, canvas.width - 16, 40);
}

function update() {
  dragon.vy += GRAVITY;
  dragon.y += dragon.vy;

  // Dragon collision with ground or ceiling
  if (dragon.y + dragon.size / 2 > canvas.height - GROUND_HEIGHT) {
    dragon.y = canvas.height - GROUND_HEIGHT - dragon.size / 2;
    gameOver = true;
  }
  if (dragon.y - dragon.size / 2 < 0) {
    dragon.y = dragon.size / 2;
    dragon.vy = 0;
  }

  // Move pipes
  pipes.forEach(pipe => pipe.x -= 2.5);
  // Remove off-screen pipes
  if (pipes.length && pipes[0].x + PIPE_WIDTH < 0) pipes.shift();
  // Add new pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) spawnPipe();

  // Collision detection
  pipes.forEach(pipe => {
    if (
      dragon.x + dragon.size / 2 > pipe.x &&
      dragon.x - dragon.size / 2 < pipe.x + PIPE_WIDTH &&
      (dragon.y - dragon.size / 2 < pipe.top || dragon.y + dragon.size / 2 > pipe.bottom)
    ) {
      gameOver = true;
    }
    // Score
    if (!pipe.passed && pipe.x + PIPE_WIDTH < dragon.x) {
      score++;
      pipe.passed = true;
      if (score > highScore) highScore = score;
    }
  });
}

function drawPixelBackground() {
  // Pixelated clouds and ground, retro style
  for (let y = 0; y < canvas.height; y += 20) {
    for (let x = 0; x < canvas.width; x += 20) {
      // Sky pixels
      if (y < canvas.height - 100 && Math.random() < 0.04) {
        ctx.fillStyle = ['#00e0ff', '#00ffee', '#b2fff7', '#aaffff'][Math.floor(Math.random()*4)];
        ctx.fillRect(x, y, 8, 8);
      }
      // Pixel clouds
      if (y < 120 && Math.random() < 0.02) {
        ctx.fillStyle = ['#e0f7fa', '#b2ebf2', '#fff'][Math.floor(Math.random()*3)];
        ctx.fillRect(x, y, 16, 8);
      }
      // Pixel ground
      if (y > canvas.height - 100 && Math.random() < 0.08) {
        ctx.fillStyle = ['#006666', '#00ffee', '#003344', '#00aaff'][Math.floor(Math.random()*4)];
        ctx.fillRect(x, y, 12, 12);
      }
    }
  }
}

function draw() {
  // Pixelated background first
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelBackground();
  drawPipes();
  drawGround();
  drawDragon();
  drawScore();
  if (gameOver) {
    ctx.fillStyle = '#00ffee';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = 'bold 18px monospace';
    ctx.fillText('Press Space or Start', canvas.width / 2, canvas.height / 2 + 20);
  }
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  resetGame();
  cancelAnimationFrame(animationId);
  gameLoop();
}

// Controls
window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (gameOver) {
      startGame();
    } else {
      dragon.vy = FLAP;
    }
  }
});
canvas.addEventListener('mousedown', () => {
  if (gameOver) {
    startGame();
  } else {
    dragon.vy = FLAP;
  }
});
startBtn.addEventListener('click', startGame);

// Initial draw
resetGame();
draw();
