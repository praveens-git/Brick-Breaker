const gameParams = {
  isGameOver: false,
  running: false,
  paddle: {
    Element: document.querySelector(".paddle"),
    Speed: 2,
  },
  ball: {
    Element: document.querySelector(".ball"),
    change: 0.2,
    position: {
      X: 0,
      Y: 0,
    },
    xVelocity: 2.5,
    yVelocity: 3,
    xAccl: 0,
    yAccl: 0,
  },
  info: document.querySelector("#info"),
  gameOver: document.querySelector("#gameOver"),
  scoreBoard: document.querySelector("#scoreBoard"),
  scoreVal: document.querySelector("#scoreVal"),
  highScoreVal: document.querySelector("#highScoreVal"),
  score: 0,
  highScore: 0,
  bricksContainer: document.querySelector(".bricks"),
  bricksArray: [],
  timer: document.querySelector("#timer"),
  streak: 0,
  isMobile: false,
  debugger: false,
  totalBrick: 0,
  powerUps: {
    powerCount: 10,
    powers: [
      {
        imgSrc: "resources/arrow.png",
        style: "",
      },
      {
        imgSrc: "resources/comet.png",
        style: "transform:rotate(45deg);",
      },
      {
        imgSrc: "resources/magnet.png",
        style: "transform:rotate(180deg);filter:invert(0);",
      },
      {
        imgSrc: "resources/rabbit.png",
        style: "transform:rotateY(180deg);",
      },
      {
        imgSrc: "resources/shield.png",
        style: "filter:invert(0);",
      },
      {
        imgSrc: "resources/turtle.png",
        style: "transform:rotate(-45deg);",
      },
      {
        imgSrc: "resources/shooter.png",
        style: "transform:rotate(90deg);",
      },
    ],
    shield: false,
    shieldElement: document.querySelector(".shield"),
    maxPaddle: 0,
    minPaddle: 0,
    shieldTimeout: 15000,
    currentPowerups: [],
    ballShootTimeout: 10000,
    ballShoot: false,
  },
};

let temp = 0;

gameParams.paddle.Element.style.left =
  window.innerWidth > 600 ? "45vw" : "40vw";

let xDown, yDown;

if (
  /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  gameParams.isMobile = true;
  document.addEventListener("touchmove", (event) => {
    let pointerLoc =
      (Math.floor(event.changedTouches[0].clientX) % window.innerWidth) -
      gameParams.paddle.Element.clientWidth / 2;

    if (pointerLoc <= 0) {
      gameParams.paddle.Element.style.left = "1px";
      return;
    }
    if (
      pointerLoc + gameParams.paddle.Element.clientWidth >=
      window.innerWidth
    ) {
      gameParams.paddle.Element.style.left =
        window.innerWidth - gameParams.paddle.Element.clientWidth + "px";
      return;
    }
    gameParams.paddle.Element.style.left = pointerLoc + "px";
  });
}

document.addEventListener("keydown", (event) => {
  if (event.code == "Space") {
    Start();
  }
  if (event.code == "KeyR") {
    gameParams.running = false;
    gameParams.isGameOver = true;
    Start();
  }
  if (event.code == "KeyD") {
    gameParams.debugger = true;
    temp++;
    if (temp > 2) {
      debug();
    }
  }
  if (event.code == "ArrowLeft") {
    if (Number(gameParams.paddle.Element.offsetLeft) <= 0) {
      gameParams.paddle.Element.style.left = "0vw";
      return;
    }
    gameParams.paddle.Element.style.left =
      Number(gameParams.paddle.Element.style.left.replace("vw", "")) -
      gameParams.paddle.Speed +
      "vw";
  }
  if (event.code == "ArrowRight") {
    if (
      Number(gameParams.paddle.Element.offsetLeft) +
        Number(gameParams.paddle.Element.clientWidth) >=
      window.innerWidth
    ) {
      gameParams.paddle.Element.style.left =
        (
          (1 - gameParams.paddle.Element.clientWidth / window.innerWidth) *
          100
        ).toFixed(2) + "vw";
      return;
    }

    gameParams.paddle.Element.style.left =
      Number(gameParams.paddle.Element.style.left.replace("vw", "")) +
      gameParams.paddle.Speed +
      "vw";
  }
});

document.addEventListener("click", (event) => {
  Start();
});

function initialise() {
  if (gameParams.running) return;
  let direction = Math.random();
  gameParams.ball.xVelocity =
    direction < 0.5 ? -gameParams.ball.xVelocity : gameParams.ball.xVelocity;

  gameParams.ball.Element.style.display = "block";

  gameParams.paddle.Element.style.left =
    window.innerWidth > 600 ? "45vw" : "40vw";

  let vmin = Math.min(window.innerHeight, window.innerWidth);

  gameParams.powerUps.maxPaddle = gameParams.isMobile ? 0.35 : 0.15;
  gameParams.powerUps.minPaddle = gameParams.isMobile ? 0.1 : 0.05;

  gameParams.ball.position.Y = window.innerHeight - Math.floor(vmin * 0.07);
  gameParams.ball.position.X = Math.floor(window.innerWidth / 2);
  gameParams.ball.Element.style.top = gameParams.ball.position.Y + "px";
  gameParams.ball.Element.style.left = gameParams.ball.position.X + "px";
}

function checkGameOver() {
  if (
    gameParams.ball.Element.offsetTop + gameParams.ball.Element.clientHeight >=
    window.innerHeight
  ) {
    if (gameParams.powerUps.shield) {
      return false;
    }
    gameParams.isGameOver = true;
    gameParams.running = false;
    gameParams.gameOver.innerHTML = "<h1>Game Over</h1>";
    gameParams.gameOver.style.display = "block";
    gameParams.highScore = Math.max(gameParams.highScore, gameParams.score);
    return true;
  }
  return false;
}

function checkBrickHit() {
  let threshold = 2;
  let offsetY = gameParams.bricksContainer.offsetTop;
  let offsetX = gameParams.bricksContainer.offsetLeft;
  //Check Whether the ball is in the range of bricks
  //Run through all bricks and check hit;
  //If yes add hit to class list

  let ballX = gameParams.ball.position.X - offsetX;
  let ballY = gameParams.ball.position.Y - offsetY;

  gameParams.bricksArray.forEach((brickObj) => {
    let hit = false;

    //Check Top and Bottom of the Brick;
    if (!brickObj.isHit) {
      if (
        brickObj.brick.offsetLeft <= ballX + 8 &&
        brickObj.brick.offsetLeft + brickObj.brick.clientWidth > ballX - 8 &&
        brickObj.brick.offsetTop < ballY + 8 &&
        brickObj.brick.offsetTop + brickObj.brick.clientHeight > ballY - 8
      ) {
        gameParams.streak++;
        if (brickObj.power != null) {
          createDrop(
            brickObj.power,
            brickObj.brick.offsetLeft + gameParams.bricksContainer.offsetLeft,
            brickObj.brick.offsetTop + gameParams.bricksContainer.offsetTop
          );
        }
        if (!gameParams.powerUps.ballShoot) {
          let val = {};

          val.top = ballY - brickObj.brick.offsetTop + 8 < threshold;
          val.bottol =
            brickObj.brick.offsetTop + brickObj.brick.clientHeight - ballY - 8 <
            threshold;
          val.left = ballX - brickObj.brick.offsetLeft + 8 < threshold;
          val.right =
            brickObj.brick.offsetLeft + brickObj.brick.clientWidth - ballX - 8 <
            threshold;

          if (val.bottol || val.top) {
            gameParams.ball.yVelocity *= -1;
          }
          if (val.left || val.right) {
            gameParams.ball.xVelocity *= -1;
          }
        }
        gameParams.score += gameParams.streak * Number(brickObj.brick.id);

        hit = true;
        gameParams.totalBrick--;
      }
    }

    if (gameParams.totalBrick == 0) {
      gameParams.gameOver.style.display = "block";
      gameParams.gameOver.innerHTML = "<h1>You Won</h1>";
      gameParams.running = false;
    }
    if (hit) {
      brickObj.isHit = true;
      brickObj.brick.className = "brick hit";
      brickObj.brick.children[0].className = "toShrink";
    }
  });
}

function paddleHit() {
  if (
    gameParams.ball.Element.offsetLeft - gameParams.paddle.Element.offsetLeft <
      gameParams.paddle.Element.clientWidth &&
    gameParams.ball.Element.offsetLeft - gameParams.paddle.Element.offsetLeft >
      0 &&
    gameParams.ball.Element.offsetTop +
      gameParams.ball.Element.clientHeight +
      gameParams.paddle.Element.clientHeight >=
      window.innerHeight
  ) {
    gameParams.streak = 0;
    distanceFromPaddle =
      gameParams.ball.Element.offsetLeft -
      gameParams.paddle.Element.offsetLeft -
      gameParams.paddle.Element.clientWidth / 2;
    velocityAlterValue = Math.random() * 0.4;
    gameParams.ball.xVelocity =
      distanceFromPaddle > 0
        ? gameParams.ball.xVelocity + velocityAlterValue
        : gameParams.ball.xVelocity - velocityAlterValue;
    gameParams.ball.yVelocity *= -1;
  }
}

function updateBallPosition() {
  //Check Paddle for Off Screen
  if (Number(gameParams.paddle.Element.offsetLeft) <= 0) {
    gameParams.paddle.Element.style.left = "0vw";
  }
  if (
    Number(gameParams.paddle.Element.offsetLeft) +
      Number(gameParams.paddle.Element.clientWidth) >=
    window.innerWidth
  ) {
    gameParams.paddle.Element.style.left =
      (
        (1 - gameParams.paddle.Element.clientWidth / window.innerWidth) *
        100
      ).toFixed(2) + "vw";
  }

  //Top & Bottom Hit
  if (
    gameParams.ball.Element.offsetTop + gameParams.ball.Element.clientHeight >=
      window.innerHeight ||
    gameParams.ball.Element.offsetTop -
      gameParams.ball.Element.clientHeight / 2 <
      0
  ) {
    gameParams.ball.yVelocity *= -1;
  }

  //Left & Right Hit
  if (
    gameParams.ball.Element.offsetLeft + gameParams.ball.Element.clientWidth >=
      window.innerWidth ||
    gameParams.ball.Element.offsetLeft -
      gameParams.ball.Element.clientWidth / 2 <
      0
  ) {
    gameParams.ball.xVelocity *= -1;
  }

  gameParams.ball.position.Y =
    Number(gameParams.ball.Element.style.top.replace("px", "")) +
    gameParams.ball.yVelocity;
  gameParams.ball.position.X =
    Number(gameParams.ball.Element.style.left.replace("px", "")) +
    gameParams.ball.xVelocity;

  gameParams.ball.Element.style.top = gameParams.ball.position.Y + "px";
  gameParams.ball.Element.style.left = gameParams.ball.position.X + "px";

  gameParams.scoreVal.textContent = gameParams.score;
  gameParams.highScore = Math.max(gameParams.highScore, gameParams.score);
  gameParams.highScoreVal.textContent = gameParams.highScore;

  // Check and Set Shield
  if (gameParams.powerUps.shield) {
    gameParams.powerUps.shieldElement.style.display = "block";
  } else {
    gameParams.powerUps.shieldElement.style.display = "none";
  }
  document.querySelector("#xVel").textContent =
    gameParams.ball.xVelocity.toFixed(2);
  document.querySelector("#yVel").textContent =
    gameParams.ball.yVelocity.toFixed(2);
}

function debug() {
  document.querySelector("#debug").style.display = "block";
}

function updateFrame() {
  if (checkGameOver()) return;
  updateBallPosition();
  checkBrickHit();
  paddleHit();
}

function Start() {
  if (gameParams.running) return;
  initialise();
  reset();
  calculateSizing();
  let countDown = [3, 2, 1, "GO"];
  i = 0;
  gameParams.timer.style.display = "block";
  let timer = setInterval(() => {
    gameParams.timer.textContent = countDown[i++];
  }, 1000);
  gameParams.info.style.display = "none";
  gameParams.gameOver.style.display = "none";
  setTimeout(() => {
    gameParams.timer.style.display = "none";
    clearInterval(timer);
    Loop();
  }, 4200);
}

function Loop() {
  if (gameParams.isGameOver) return;
  if (!gameParams.running) return;
  if (gameParams.powerUps.currentPowerups.length) updateDrop();
  updateFrame();
  requestAnimationFrame(Loop);
}

function createTable(rows, columns) {
  const colors = [
    "#4196e1",
    "#000080",
    "#228B22",
    "#FFA500",
    "#FF4500",
    "#FF0000",
    "#00FFFF",
    "#9370D8",
  ];
  gameParams.bricksContainer.innerHTML = "";
  gameParams.bricksContainer.setAttribute("cellSpacing", 0);
  for (let r = 0; r < rows; r++) {
    let row = document.createElement("tr");
    for (let c = 0; c < columns; c++) {
      let cell = document.createElement("td");
      cell.className = "brick";
      gameParams.bricksArray.push({
        isHit: false,
        position: {
          x: c,
          y: r,
        },
        power: null,
        brick: cell,
      });
      Score = Math.ceil(
        Math.max(rows / 2, columns / 2) /
          Math.sqrt(
            Math.abs(
              Math.floor(rows / 2 - r) ** 2 + Math.floor(columns / 2 - c) ** 2
            )
          )
      );
      Score =
        Score == Infinity ? Math.ceil(Math.max(rows / 2, columns / 2)) : Score;
      cell.id = Score;
      cell.style.background = `${colors[Score % colors.length]}B0`;
      cell.style.boxShadow = `inset 0 0 10px 10px ${
        colors[Score % colors.length]
      }A0`;
      let div = document.createElement("div");
      div.style.background = `${colors[Score % colors.length]}B0`;
      div.style.boxShadow = `inset 0 0 10px 10px ${
        colors[Score % colors.length]
      }A0`;
      cell.appendChild(div);
      row.appendChild(cell);
    }
    gameParams.bricksContainer.appendChild(row);
  }
  gameParams.totalBrick = gameParams.bricksArray.length;
  setPowerUps();
}

function setPowerUps() {
  for (let i = 0; i < gameParams.powerUps.powerCount; i++) {
    let element =
      gameParams.bricksArray[
        Math.floor(Math.random() * gameParams.bricksArray.length)
      ];
    if (element.power == null) {
      let power = Math.floor(Math.random() * gameParams.powerUps.powers.length);

      // ? Improve: Add Magnet Power Call and Shooting Power Call
      if (power == 2 || power == 6) {
        power = Math.random() > 0.5 ? 1 : 5;
      }
      // ? Improve: Add Magnet Power Call and Shooting Power Call

      element["power"] = power;
    } else {
      i--;
    }
  }
}

function calculateSizing() {
  gameParams.isMobile ? createTable(16, 8) : createTable(11, 15);
}

/*
Drops:
  Shrink      🗸
  Extend      🗸
  BallShoot   🗸
  Attract     🗸
  Protector   🗸
  Rapid       🗸
  Slower      🗸
  PaddleShoot 🗸
*/

function reset() {
  gameParams.bricksArray = [];
  gameParams.powerUps.currentPowerups = [];
  gameParams.isGameOver = false;
  gameParams.running = true;
  gameParams.score = 0;
  document.querySelector("#powerUps").innerHTML = "";
}

function ShrinkPaddle() {
  if (
    gameParams.paddle.Element.clientWidth * 0.75 <
    window.innerWidth * gameParams.powerUps.minPaddle
  ) {
    gameParams.paddle.Element.style.width = `${
      window.innerWidth * gameParams.powerUps.minPaddle
    }px`;
    return;
  }
  gameParams.paddle.Element.style.width =
    gameParams.paddle.Element.clientWidth * 0.75 + "px";
}

function ExtendPaddle() {
  gameParams.highScoreVal.textContent = gameParams.powerUps.maxPaddle;
  if (
    gameParams.paddle.Element.clientWidth * 1.25 >
    window.innerWidth * gameParams.powerUps.maxPaddle
  ) {
    gameParams.paddle.Element.style.width = `${
      window.innerWidth * gameParams.powerUps.maxPaddle
    }px`;
    return;
  }
  gameParams.paddle.Element.style.width =
    gameParams.paddle.Element.clientWidth * 1.25 + "px";
}

function createDrop(type = 0, x, y) {
  if (type > gameParams.powerUps.powers.length) return;
  let powerBox = document.createElement("div");
  powerBox.className = "powerup";
  let power = document.createElement("img");
  if (type == gameParams.powerUps.powers.length || type == 0) {
    let style2 = "transform:rotateY(180deg)";
    let power2 = document.createElement("img");
    power.src = gameParams.powerUps.powers[0].imgSrc;
    power2.src = gameParams.powerUps.powers[0].imgSrc;
    power.style = gameParams.powerUps.powers[0].style;
    power2.style = gameParams.powerUps.powers[0].style + style2;
    if (type == 0) {
      powerBox.appendChild(power);
      powerBox.appendChild(power2);
    } else {
      powerBox.appendChild(power2);
      powerBox.appendChild(power);
    }
  } else {
    power.src = gameParams.powerUps.powers[type].imgSrc;
    power.style = gameParams.powerUps.powers[type].style;
    powerBox.appendChild(power);
  }
  powerBox.id = type;
  powerBox.style.left = x + "px";
  powerBox.style.top = y + "px";
  gameParams.powerUps.currentPowerups.push({
    powerBox,
    yVelocity: -3,
    yAccl: 0.05,
  });
  document.querySelector("#powerUps").appendChild(powerBox);
}

function updateDrop() {
  gameParams.powerUps.currentPowerups.forEach((powerup) => {
    if (
      Number(powerup.powerBox.style.top.replace("px", "")) + powerup.yVelocity <
      window.innerHeight - powerup.powerBox.clientHeight
    ) {
      powerup.yVelocity += powerup.yAccl;
      powerup.powerBox.style.top =
        Number(powerup.powerBox.style.top.replace("px", "")) +
        powerup.yVelocity +
        "px";
    }
    checkDropCatch(powerup);
    if (
      Number(powerup.powerBox.style.top.replace("px", "")) +
        powerup.yVelocity >=
      window.innerHeight - powerup.powerBox.clientHeight
    ) {
      document.querySelector("#powerUps").removeChild(powerup.powerBox);
      gameParams.powerUps.currentPowerups =
        gameParams.powerUps.currentPowerups.filter((power) => {
          return power != powerup;
        });
    }
  });
}

function createShield() {
  gameParams.powerUps.shield = true;
  setTimeout(() => {
    gameParams.powerUps.shield = false;
  }, gameParams.powerUps.shieldTimeout);
}

function checkDropCatch(powerup) {
  if (
    Number(powerup.powerBox.style.top.replace("px", "")) +
      powerup.powerBox.clientHeight +
      3 >=
      window.innerHeight &&
    Number(powerup.powerBox.style.left.replace("px", "")) +
      powerup.powerBox.clientWidth / 2 >=
      gameParams.paddle.Element.offsetLeft &&
    Number(powerup.powerBox.style.left.replace("px", "")) +
      powerup.powerBox.clientWidth / 2 <=
      gameParams.paddle.Element.offsetLeft +
        gameParams.paddle.Element.clientWidth
  ) {
    switch (Number(powerup.powerBox.id)) {
      case 0:
        ExtendPaddle();
        break;
      case 1:
        ballShoot();
        break;
      case 2:
        // TODO: Magnet
        break;
      case 3:
        speedUpDown(true);
        break;
      case 4:
        createShield();
        break;
      case 5:
        speedUpDown(false);
        break;
      case 6:
        // TODO: Shoot
        break;
      case 7:
        ShrinkPaddle();
        break;

      default:
        break;
    }
  }
}

function ballShoot() {
  gameParams.powerUps.ballShoot = true;
  setTimeout(() => {
    gameParams.powerUps.ballShoot = false;
  }, gameParams.powerUps.ballShootTimeout);
}

function speedUpDown(isUp = false) {
  if (Math.random() > 0.5) {
    gameParams.ball.xVelocity += isUp
      ? gameParams.ball.change
      : -gameParams.ball.change;
  } else {
    gameParams.ball.yVelocity += isUp
      ? gameParams.ball.change
      : -gameParams.ball.change;
  }
}

/*
Attributions Extended:
  Rabbit - Image by <a href="https://pixabay.com/users/clker-free-vector-images-3736/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=312164">Clker-Free-Vector-Images</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=312164">Pixabay</a>
  Turtle - Image by <a href="https://pixabay.com/users/clker-free-vector-images-3736/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=305215">Clker-Free-Vector-Images</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=305215">Pixabay</a>
  Comet -Image by <a href="https://pixabay.com/users/kmicican-2305081/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1893874">kmicican</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1893874">Pixabay</a>
  Magnet - Image by <a href="https://pixabay.com/users/clker-free-vector-images-3736/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=41167">Clker-Free-Vector-Images</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=41167">Pixabay</a>
  Shield - Image by <a href="https://pixabay.com/users/clker-free-vector-images-3736/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=303392">Clker-Free-Vector-Images</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=303392">Pixabay</a>
  Arrow - Image by <a href="https://pixabay.com/users/clker-free-vector-images-3736/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=297787">Clker-Free-Vector-Images</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=297787">Pixabay</a>
  Jet - Image by <a href="https://pixabay.com/users/wmu-13212423/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=6403637">WMU</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=6403637">Pixabay</a>
*/
