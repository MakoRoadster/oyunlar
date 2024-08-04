const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const carWidth = 40;
const carHeight = 70;
let carX = (canvas.width - carWidth) / 2;
let carY = canvas.height - carHeight - 20;
const carSpeed = 5;

const roadWidth = 200;
const roadX = (canvas.width - roadWidth) / 2;

let roadY = 0;
let roadSpeed = 2;

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
  KeyA: false,
  KeyD: false,
  KeyW: false,
  KeyS: false
};

const enemyCars = [];
const enemyCarWidth = 40;
const enemyCarHeight = 70;
const minSpeed = 3;
const maxSpeed = 7;

let score = 0;
let gameOver = false;
let elapsedTime = 0;

const carImage = new Image();
carImage.src = 'file.png'; // Oyuncu arabası görseli

const enemyCarImage = new Image();
enemyCarImage.src = 'file1.png'; // Düşman arabası görseli

function createEnemyCar() {
  const enemyX = roadX + Math.floor(Math.random() * (roadWidth - enemyCarWidth));
  const enemyY = -enemyCarHeight;
  const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

  let safeToAdd = true;
  for (let i = 0; i < enemyCars.length; i++) {
    const existingCar = enemyCars[i];
    if (enemyY - existingCar.y < carHeight && Math.abs(existingCar.x - enemyX) < carWidth) {
      safeToAdd = false;
      break;
    }
  }

  if (safeToAdd) {
    enemyCars.push({ x: enemyX, y: enemyY, speed: speed });
  }
}

function drawCar() {
  ctx.drawImage(carImage, carX, carY, carWidth, carHeight);
}

function drawRoad() {
  ctx.fillStyle = 'grey';
  ctx.fillRect(roadX, roadY, roadWidth, canvas.height);
  ctx.fillRect(roadX, roadY - canvas.height, roadWidth, canvas.height);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(roadX + roadWidth / 2, roadY);
  ctx.lineTo(roadX + roadWidth / 2, roadY + canvas.height);
  ctx.moveTo(roadX + roadWidth / 2, roadY - canvas.height);
  ctx.lineTo(roadX + roadWidth / 2, roadY);
  ctx.stroke();
}

function drawEnemyCars() {
  enemyCars.forEach(enemyCar => {
    ctx.drawImage(enemyCarImage, enemyCar.x, enemyCar.y, enemyCarWidth, enemyCarHeight);
    enemyCar.y += enemyCar.speed;
  });
}

function update() {
  if ((keys.ArrowLeft || keys.KeyA) && carX > roadX) {
    carX -= carSpeed;
  }
  if ((keys.ArrowRight || keys.KeyD) && carX < roadX + roadWidth - carWidth) {
    carX += carSpeed;
  }
  if ((keys.ArrowUp || keys.KeyW) && carY > 0) {
    carY -= carSpeed;
  }
  if ((keys.ArrowDown || keys.KeyS) && carY < canvas.height - carHeight) {
    carY += carSpeed;
  }
  roadY += roadSpeed;
  if (roadY >= canvas.height) {
    roadY = 0;
  }

  // Skoru geçen zamana göre artır
  elapsedTime += 1 / 60; // oyunun 60 FPS çalıştığını varsayıyoruz
  if (elapsedTime >= 1) {
    score += 1;
    document.getElementById('score').innerText = `Score: ${score}`;
    elapsedTime = 0;
  }

  enemyCars.forEach((enemyCar, index) => {
    if (enemyCar.y > canvas.height) {
      enemyCars.splice(index, 1);
    }
  });

  if (Math.random() < 0.01) {
    createEnemyCar();
  }
}

function checkCollision() {
  enemyCars.forEach(enemyCar => {
    if (
      carX < enemyCar.x + enemyCarWidth &&
      carX + carWidth > enemyCar.x &&
      carY < enemyCar.y + enemyCarHeight &&
      carY + carHeight > enemyCar.y
    ) {
      gameOver = true;
      document.getElementById('restartButton').style.display = 'block';
      document.getElementById('score').innerText += ' - Game Over!';
    }
  });
}

function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  drawCar();
  drawEnemyCars();
  update();
  checkCollision();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  gameOver = false;
  score = 0;
  elapsedTime = 0; // Geçen zamanı sıfırla
  carX = (canvas.width - carWidth) / 2;
  carY = canvas.height - carHeight - 20;
  enemyCars.length = 0;
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('restartButton').style.display = 'none';
  gameLoop();
}

document.addEventListener('keydown', (e) => {
  if (e.code in keys) {
    keys[e.code] = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code in keys) {
    keys[e.code] = false;
  }
});

carImage.onload = gameLoop;
