const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Araba ve oyun özellikleri
const carWidth = 40;
const carHeight = 70;
let carX = (canvas.width - carWidth) / 2;
let carY = canvas.height - carHeight - 20;
const carSpeed = 5;
let isInvisible = false;
let invisibleTimeout;

// Yol özellikleri
const roadWidth = 200;
const roadX = (canvas.width - roadWidth) / 2;

let roadY = 0;
let roadSpeed = 2;

// Tuşlar
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

// Düşman arabalar
const enemyCars = [];
const enemyCarWidth = 40;
const enemyCarHeight = 70;

// Kutu
const boxWidth = 30;
const boxHeight = 30;
const boxes = [];
const boxAppearanceRate = 0.00041; // Kutu çıkma oranı

// Skor ve oyun durumu
let score = 0;
let gameOver = false;
let elapsedTime = 0;

// Görseller
const carImage = new Image();
carImage.src = 'file.png'; // Oyuncu arabası görseli
const invisibleCarImage = new Image();
invisibleCarImage.src = 'file2.png'; // Görünmez araba görseli
const enemyCarImage = new Image();
enemyCarImage.src = 'file1.png'; // Düşman arabası görseli
const boxImage = new Image();
boxImage.src = '59394.png'; // Kutu görseli

// Düşman arabalarının hızını güncelle
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

// Düşman arabası oluştur
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

// Kutu oluştur
function createBox() {
  const boxX = roadX + Math.floor(Math.random() * (roadWidth - boxWidth));
  const boxY = -boxHeight;

  let safeToAdd = true;
  for (let i = 0; i < boxes.length; i++) {
    const existingBox = boxes[i];
    if (Math.abs(existingBox.y - boxY) < boxHeight && Math.abs(existingBox.x - boxX) < boxWidth) {
      safeToAdd = false;
      break;
    }
  }

  if (safeToAdd) {
    boxes.push({ x: boxX, y: boxY });
  }
}

// Araba çiz
function drawCar() {
  if (isInvisible) {
    ctx.drawImage(invisibleCarImage, carX, carY, carWidth, carHeight);
  } else {
    ctx.drawImage(carImage, carX, carY, carWidth, carHeight);
  }
}

// Yol çiz
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

// Düşman arabalarını çiz
function drawEnemyCars() {
  enemyCars.forEach(enemyCar => {
    ctx.drawImage(enemyCarImage, enemyCar.x, enemyCar.y, enemyCarWidth, enemyCarHeight);
    enemyCar.y += enemyCar.speed;
  });
}

// Kutuları çiz
function drawBoxes() {
  boxes.forEach(box => {
    ctx.drawImage(boxImage, box.x, box.y, boxWidth, boxHeight);
    box.y += roadSpeed;
  });
}

// Güncelleme fonksiyonu
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

  // Düşman arabalarını ekrandan çıkar
  enemyCars.forEach((enemyCar, index) => {
    if (enemyCar.y > canvas.height) {
      enemyCars.splice(index, 1);
    }
  });

  // Kutuları ekrandan çıkar
  boxes.forEach((box, index) => {
    if (box.y > canvas.height) {
      boxes.splice(index, 1);
    }
  });

  // Yeni düşman arabası ve kutu oluştur
  if (Math.random() < 0.012) {
    createEnemyCar();
  }
  if (Math.random() < boxAppearanceRate) {
    createBox();
  }
}

// Çarpışma kontrolü
function checkCollision() {
  if (isInvisible) return;

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

  boxes.forEach((box, index) => {
    if (
      carX < box.x + boxWidth &&
      carX + carWidth > box.x &&
      carY < box.y + boxHeight &&
      carY + carHeight > box.y
    ) {
      boxes.splice(index, 1);
      makeCarInvisible();
    }
  });
}

// Arabayı görünmez yap
function makeCarInvisible() {
  isInvisible = true;
  if (invisibleTimeout) clearTimeout(invisibleTimeout);
  invisibleTimeout = setTimeout(() => {
    isInvisible = false;
  }, 6000);
}

// Oyun döngüsü
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

// Oyun başlatma
document.addEventListener('keydown', (event) => {
  keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

document.getElementById('restartButton').addEventListener('click', () => {
  location.reload();
});

gameLoop();
