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
  ctx.fillStyle = 'red';
  for (let i = 0; i < enemyCars.length; i++) {
    const enemyCar = enemyCars[i];
    ctx.drawImage(enemyCarImage, enemyCar.x, enemyCar.y, enemyCarWidth, enemyCarHeight);
  }
}

// Kutuları çiz
function drawBoxes() {
  ctx.fillStyle = 'blue';
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    ctx.drawImage(boxImage, box.x, box.y, boxWidth, boxHeight);
  }
}

// Çarpışma kontrolü
function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Oyun döngüsü
function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Yol çizme ve kaydırma
  drawRoad();
  roadY += roadSpeed;
  if (roadY >= canvas.height) {
    roadY = 0;
  }

  // Araba çizme
  drawCar();

  // Düşman arabalarını güncelleme ve çizme
  for (let i = 0; i < enemyCars.length; i++) {
    const enemyCar = enemyCars[i];
    enemyCar.y += enemyCar.speed;
    if (!isInvisible && checkCollision({ x: carX, y: carY, width: carWidth, height: carHeight }, { x: enemyCar.x, y: enemyCar.y, width: enemyCarWidth, height: enemyCarHeight })) {
      gameOver = true;
      document.getElementById('restartButton').style.display = 'block';
      document.getElementById('score').textContent = 'Score: ' + score;
      return;
    }
    if (enemyCar.y > canvas.height) {
      enemyCars.splice(i, 1);
      i--;
    }
  }

  drawEnemyCars();

  // Kutuları güncelleme ve çizme
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    box.y += roadSpeed;
    if (!isInvisible && checkCollision({ x: carX, y: carY, width: carWidth, height: carHeight }, { x: box.x, y: box.y, width: boxWidth, height: boxHeight })) {
      isInvisible = true;
      clearTimeout(invisibleTimeout); // Mevcut zamanlayıcıyı temizle
      invisibleTimeout = setTimeout(() => {
        isInvisible = false;
      }, 5000); // 5 saniye görünmez ol
      boxes.splice(i, 1);
      i--;
    } else if (box.y > canvas.height) {
      boxes.splice(i, 1);
      i--;
    }
  }

  drawBoxes();

  // Araba hareketi
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

  // Düşman arabası oluşturma
  if (Math.random() < 0.02) {
    createEnemyCar();
  }

  // Kutu oluşturma
  if (Math.random() < boxAppearanceRate) {
    createBox();
  }

  // Skoru güncelleme
  document.getElementById('score').textContent = 'Score: ' + score;

  requestAnimationFrame(gameLoop);
}

// Skorun her saniye artmasını sağla
function incrementScore() {
  if (!gameOver) {
    score++;
    document.getElementById('score').textContent = 'Score: ' + score;
    setTimeout(incrementScore, 1000);
  }
}

// Oyun yeniden başlatma
document.getElementById('restartButton').addEventListener('click', () => {
  carX = (canvas.width - carWidth) / 2;
  carY = canvas.height - carHeight - 20;
  enemyCars.length = 0;
  boxes.length = 0;
  score = 0;
  elapsedTime = 0;
  gameOver = false;
  document.getElementById('restartButton').style.display = 'none';
  gameLoop();
  incrementScore(); // Skoru her saniye artırmaya başla
});

// Tuş dinleyicileri
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

// Dokunma olaylarını dinleyicilere ekle
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

leftButton.addEventListener('touchstart', () => keys.ArrowLeft = true);
leftButton.addEventListener('touchend', () => keys.ArrowLeft = false);
rightButton.addEventListener('touchstart', () => keys.ArrowRight = true);
rightButton.addEventListener('touchend', () => keys.ArrowRight = false);

// Yakınlaştırmayı ve seçimleri devre dışı bırak
document.addEventListener('touchmove', function(event) {
  event.preventDefault();
}, { passive: false });

document.addEventListener('touchstart', function(event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

document.addEventListener('gesturestart', function(event) {
  event.preventDefault();
});

// Oyunu başlat
gameLoop();
incrementScore(); // Skoru her saniye artırmaya başla
