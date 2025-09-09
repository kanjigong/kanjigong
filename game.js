const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let timeLeft = 40;
let bullets = [];
let words = [];
let keys = {};
let playerX = canvas.width / 2;
const playerWidth = 50;
const playerHeight = 30;

const goodSound = document.getElementById("goodSound");
const badSound = document.getElementById("badSound");

// 단어 목록
const goodWords = ["존중", "배려", "용기", "우정", "도움", "사과", "경청", "친절", "협력", "신뢰", "공감"];
const badWords = ["욕설", "폭력", "괴롭힘", "따돌림", "무시", "비하", "왕따", "조롱", "놀림", "위협", "사이버폭력력"];
const allWords = [...goodWords, ...badWords];

function randomWord() {
  const text = allWords[Math.floor(Math.random() * allWords.length)];
  return {
    text,
    x: Math.random() * (canvas.width - 80),
    y: -30,
    speed: 1 + Math.random() * 1.5,
    isGood: goodWords.includes(text),
    hit: false
  };
}

function spawnWord() {
  if (words.length < 10) {
    words.push(randomWord());
  }
}

function shootBullet() {
  bullets.push({
    x: playerX + playerWidth / 2 - 2,
    y: canvas.height - playerHeight - 10,
    speed: 5
  });
}

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space") shootBullet();
});
document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// ✅ 모바일 터치 조작
let touchX = null;
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  touchX = e.touches[0].clientX;
  shootBullet(); // 터치할 때마다 총알 발사
});
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  touchX = e.touches[0].clientX;
});
canvas.addEventListener("touchend", () => {
  touchX = null;
});

function update() {
  // 키보드 이동
  if (keys["ArrowLeft"]) playerX -= 5;
  if (keys["ArrowRight"]) playerX += 5;

  // 터치 이동
  if (touchX !== null) {
    playerX = touchX - playerWidth / 2;
  }

  // 범위 제한
  playerX = Math.max(0, Math.min(canvas.width - playerWidth, playerX));

  // 단어 & 총알 이동
  words.forEach(word => word.y += word.speed);
  bullets.forEach(b => b.y -= b.speed);

  // 충돌 체크
  bullets.forEach((bullet, bIdx) => {
    words.forEach((word, wIdx) => {
      if (
        !word.hit &&
        bullet.x > word.x &&
        bullet.x < word.x + 60 &&
        bullet.y < word.y &&
        bullet.y > word.y - 30
      ) {
        word.hit = true;
        bullets.splice(bIdx, 1);
        if (word.isGood) {
          score += 2;
          goodSound.currentTime = 0;
          goodSound.play();
        } else {
          score -= 3;
          badSound.currentTime = 0;
          badSound.play();
        }
      }
    });
  });

  // 정리
  bullets = bullets.filter(b => b.y > 0);
  words = words.filter(w => w.y < canvas.height && !w.hit);

  // 타이머
  if (frameCount % 60 === 0) timeLeft--;
  if (timeLeft <= 0) endGame();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 플레이어
  ctx.fillStyle = "blue";
  ctx.fillRect(playerX, canvas.height - playerHeight, playerWidth, playerHeight);

  // 총알
  ctx.fillStyle = "black";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

  // 단어
  words.forEach(word => {
    ctx.font = "20px Arial";
    ctx.fillStyle = word.isGood ? "green" : "red";
    ctx.fillText(word.text, word.x, word.y);
  });

  // HUD
  document.getElementById("hud").innerText = `점수: ${score} | 시간: ${timeLeft}`;
}

function endGame() {
  clearInterval(gameInterval);
  const msg = getRankMessage(score);
  document.getElementById("endMessage").innerHTML = `게임 종료!<br>당신의 점수는 <strong>${score}</strong>점입니다.<br>${msg}`;
  document.getElementById("endMessage").style.display = "block";
}

function getRankMessage(score) {
  if (score >= 20) return "🎉 훌륭한 가치관을 가진 어른입니다!";
  if (score >= 10) return "👍 긍정적인 중학생 수준이에요!";
  if (score >= 0) return "🙂 좋은 시작이에요. 더 노력해봐요!";
  return "😢 부정적인 단어가 많았어요. 다시 도전해봐요!";
}

let frameCount = 0;
const gameInterval = setInterval(() => {
  frameCount++;
  update();
  draw();
  if (frameCount % 30 === 0) spawnWord();
}, 1000 / 60);

