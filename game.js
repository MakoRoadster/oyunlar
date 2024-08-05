const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const carWidth = 40;
const carHeight = 70;
const invisibleCarWidth = 40; 
const invisibleCarHeight = 70;
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

let score = 0;
let gameOver = false;
let elapsedTime = 0;

const carImage = new Image();
carImage.src = 'file.png'; // Oyuncu arabası görseli

const invisibleCarImage = new Image();
invisibleCarImage.src = 'file2.png'; // Görünmez araba görseli

const enemyCarImage = new Image();
enemyCarImage.src = 'file1.png'; // Düşman arabası görseli

const boxImage = new Image();
boxImage.src = '59394.png'; // Kutu görseli

const boxes = [];
const boxWidth = 30;
const boxHeight = 30;
const boxInterval = 0.0003; // Kutu çıkma olasılığı

let isInvisible = false;
let invisibleTime = 0;
const invisibleDuration = 10; // Görünmezlik süresi

function getEnemyCarSpeed() {
  if (score >= 210) {
    return 14 + Math.random() * (19 - 14); // 14-19 aralığında hız
  } else if (score >= 180) {
    return 12 + Math.random() * (17 - 12); // 8-14 aralığında hız
  } else if (score >= 150) {
    return 10 + Math.random() * (15 - 10); // 7-13 aralığında hız
  } else if (score >= 120) {
    return 8 + Math.random() * (13 - 8); // 6-11 aralığında hız
  } else if (score >= 90) {
    return 6 + Math.random() * (11 - 6); // 5-9 aralığında hız
  } else if (score >= 60) {
    return 5 + Math.random() * (9 - 5); // 3-8 aralığında hız
  } else if (score >= 30) {
    return 4 + Math.random() * (8 - 4); // 3-7 aralığında hız
  }  else {
    return 3 + Math.random() * (7 - 3); // normal hiz
  }
}

function createEnemyCar() {
  const enemyX = roadX + Math.floor(Math.random() * (roadWidth - enemyCarWidth));
  const enemyY = -enemyCarHeight;
  const speed = getEnemyCarSpeed(); // Dinamik hız

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

function createBox() {
  const boxX = roadX + Math.floor(Math.random() * (roadWidth - boxWidth));
  const boxY = -boxHeight;

  boxes.push({ x: boxX, y: boxY });
}

function drawCar() {
  if (isInvisible) {
    ctx.drawImage(invisibleCarImage, carX, carY, invisibleCarWidth, invisibleCarHeight);
  } else {
    ctx.drawImage(carImage, carX, carY, carWidth, carHeight);
  }
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

function drawBoxes() {
  boxes.forEach(box => {
    ctx.drawImage(boxImage, box.x, box.y, boxWidth, boxHeight);
    box.y += roadSpeed; // Kutu da yol hızına göre hareket eder
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

  if (Math.random() < 0.015) {
    createEnemyCar();
  }

  if (Math.random() < boxInterval) {
    createBox();
  }

  boxes.forEach((box, index) => {
    if (box.y > canvas.height) {
      boxes.splice(index, 1);
    }
  });

  if (isInvisible) {
    invisibleTime += 1 / 60;
    if (invisibleTime >= invisibleDuration) {
      isInvisible = false;
      invisibleTime = 0;
    }
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
      if (!isInvisible) {
        gameOver = true;
        document.getElementById('restartButton').style.display = 'block';
        document.getElementById('score').innerText += ' - Game Over!';
      }
    }
  });

  boxes.forEach((box, index) => {
    if (
      carX < box.x + boxWidth &&
      carX + carWidth > box.x &&
      carY < box.y + boxHeight &&
      carY + carHeight > box.y
    ) {
      boxes.splice(index, 1); // Kutu alındıktan sonra kaldır
      isInvisible = true;
      invisibleTime = 0;
    }
  });
}

function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  drawCar();
  drawEnemyCars();
  drawBoxes();
  update();
  checkCollision();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  gameOver = false;
  score = 0;
  enemyCars.length = 0;
  boxes.length = 0;
  carX = (canvas.width - carWidth) / 2;
  carY = canvas.height - carHeight - 20;
  document.getElementById('restartButton').style.display = 'none';
}

document.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = false;
  }
});

document.getElementById('restartButton').addEventListener('click', restartGame);

document.getElementById('leftButton').addEventListener('click', () => {
  if (carX > roadX) {
    carX -= carSpeed;
  }
});

document.getElementById('rightButton').addEventListener('click', () => {
  if (carX < roadX + roadWidth - carWidth) {
    carX += carSpeed;
  }
});

gameLoop();
