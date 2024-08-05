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

const boxes = [];
const boxWidth = 30;
const boxHeight = 30;

let score = 0;
let gameOver = false;
let elapsedTime = 0;
let isInvisible = false;
let invisibleTimer = 0;

const carImage = new Image();
carImage.src = 'file.png'; // Oyuncu arabası görseli

const invisibleCarImage = new Image();
invisibleCarImage.src = 'file2.png'; // Görünmez arabanın görseli

const enemyCarImage = new Image();
enemyCarImage.src = 'file1.png'; // Düşman arabası görseli

const boxImage = new Image();
boxImage.src = '59394.png'; // Kutu görseli

function updateEnemyCarSpeed() {
  if (score >= 210) {
    return { min: 19, max: 14 };
  } else if (score >= 180) {
    return { min: 17, max: 12 };
  } else if (score >= 150) {
    return { min: 15, max: 10 };
  } else if (score >= 120) {
    return { min: 13, max: 8 };
  } else if (score >= 90) {
    return { min: 11, max: 6 };
  } else if (score >= 60) {
    return { min: 9, max: 5 };
  } else if (score >= 30) {
    return { min: 8, max: 4 };
  } else {
    return { min: 3, max: 7 }; // Varsayılan hız aralığı
  }
}

function createEnemyCar() {
  const { min, max } = updateEnemyCarSpeed();
  const enemyX = roadX + Math.floor(Math.random() * (roadWidth - enemyCarWidth));
  const enemyY = -enemyCarHeight;
  const speed = min + Math.random() * (max - min);

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
    ctx.drawImage(invisibleCarImage, carX, carY, carWidth, carHeight);
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
    box.y += roadSpeed;
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

  if (boxes.length === 0 && Math.random() < 0.01) {
    createBox();
  }

  if (Math.random() < 0.01) {
    createEnemyCar();
  }

  // Görünmezlik zamanlayıcısı
  if (isInvisible) {
    invisibleTimer -= 1 / 60;
    if (invisibleTimer <= 0) {
      isInvisible = false;
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
      isInvisible = true;
      invisibleTimer = 10; // 10 saniye
      boxes.splice(index, 1); // Kutu toplandığında diziden kaldır
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
  elapsedTime = 0; // Geçen zamanı sıfırla
  carX = (canvas.width - carWidth) / 2;
  carY = canvas.height - carHeight - 20;
  enemyCars.length = 0;
  boxes.length = 0; // Kutuları sıfırla
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

// Mobil Kontroller için Event Listener
document.getElementById('leftButton').addEventListener('touchstart', (event) => {
  event.preventDefault();
  keys.ArrowLeft = true;
});
document.getElementById('leftButton').addEventListener('touchend', (event) => {
  event.preventDefault();
  keys.ArrowLeft = false;
});
document.getElementById('rightButton').addEventListener('touchstart', (event) => {
  event.preventDefault();
  keys.ArrowRight = true;
});
document.getElementById('rightButton').addEventListener('touchend', (event) => {
  event.preventDefault();
  keys.ArrowRight = false;
});
document.getElementById('upButton').addEventListener('touchstart', (event) => {
  event.preventDefault();
  keys.ArrowUp = true;
});
document.getElementById('upButton').addEventListener('touchend', (event) => {
  event.preventDefault();
  keys.ArrowUp = false;
});
document.getElementById('downButton').addEventListener('touchstart', (event) => {
  event.preventDefault();
  keys.ArrowDown = true;
});
document.getElementById('downButton').addEventListener('touchend', (event) => {
  event.preventDefault();
  keys.ArrowDown = false;
});

gameLoop();
