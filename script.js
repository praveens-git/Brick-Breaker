const gameParams = {
  isGameOver: false,
  running: false,
  paddle: {
    Element: document.querySelector(".paddle"),
    Speed: 2,
  },
  ball: {
    Element: document.querySelector(".ball"),
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
};

gameParams.paddle.Element.style.left =
  window.innerWidth > 600 ? "45vw" : "40vw";

let xDown, yDown;

document.addEventListener("touchstart", (evt) => {
  const firstTouch = (evt.touches || evt.originalEvent.touches)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
});

document.addEventListener("click", (event) => {
  Start();
});
document.addEventListener("touchmove", (event) => {
  if (!xDown || !yDown) {
    return;
  }

  var xUp = event.touches[0].clientX;
  var yUp = event.touches[0].clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0) {
      /* right swipe */
      if (Number(gameParams.paddle.Element.offsetLeft) <= 0) {
        gameParams.paddle.Element.style.left = "0vw";
        return;
      }
      gameParams.paddle.Element.style.left =
        Number(gameParams.paddle.Element.style.left.replace("vw", "")) -
        Math.round(xDiff / 2) * 2 +
        "vw";
    } else {
      /* left swipe */
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
        Math.abs(Math.round(xDiff / 2) * 2) +
        "vw";
    }
  }
  /* reset values */
  xDown = null;
  yDown = null;
});

document.addEventListener("keydown", (event) => {
  if (event.code == "Space") {
    Start();
  }
  if (event.code == "KeyR") {
    gameParams.running = false;
    Start();
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

function initialise() {
  if (gameParams.running) return;
  // gameParams.ball.xVelocity = Number(2 + (Math.random()).toFixed(2));
  // gameParams.ball.yVelocity = -Number((2 + Math.random()).toFixed(2));
  let direction = Math.random();
  gameParams.ball.xVelocity =
    direction < 0.5 ? -gameParams.ball.xVelocity : gameParams.ball.xVelocity;

  gameParams.ball.Element.style.display = "block";

  gameParams.paddle.Element.style.left =
    window.innerWidth > 600 ? "45vw" : "40vw";

  gameParams.ball.position.Y = Math.floor(window.innerHeight * 0.96);
  gameParams.ball.position.X = Math.floor(window.innerWidth / 2);
  gameParams.ball.Element.style.top = gameParams.ball.position.Y + "px";
  gameParams.ball.Element.style.left = gameParams.ball.position.X + "px";
}

function checkGameOver() {
  if (
    gameParams.ball.Element.offsetTop + gameParams.ball.Element.clientHeight >=
    window.innerHeight
  ) {
    gameParams.isGameOver = true;
    gameParams.running = false;
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
        gameParams.score += gameParams.streak * Number(brickObj.brick.id);

        hit = true;
      }
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
    gameParams.streak = 0;
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
    gameParams.streak = 0;
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
}

function updateFrame() {
  if (checkGameOver()) return;
  updateBallPosition();
  checkBrickHit();
  paddleHit();
}

function Start() {
  if (gameParams.running) return;
  calculateSizing();
  initialise();
  gameParams.isGameOver = false;
  gameParams.running = true;
  gameParams.score = 0;
  let countDown = [3, 2, 1, "GO"];
  i = 0;
  gameParams.timer.style.display = "block";
  let timer = setInterval(() => {
    gameParams.timer.textContent = countDown[i++];
  }, 1000);
  setTimeout(() => {
    clearInterval(timer);
    gameParams.info.style.display = "none";
    gameParams.timer.style.display = "none";
    gameParams.gameOver.style.display = "none";
    Loop();
  }, 4200);
}

function Loop() {
  if (gameParams.isGameOver) return;
  updateFrame();
  requestAnimationFrame(Loop);
}

function createTable(rows, columns) {
  console.log(
    gameParams.bricksContainer.clientHeight,
    gameParams.bricksContainer.clientWidth
  );
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
      let column = document.createElement("td");
      column.className = "brick";
      gameParams.bricksArray.push({
        isHit: false,
        position: {
          x: c,
          y: r,
        },
        brick: column,
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
      column.id = Score;
      column.style.background = `${colors[Score % colors.length]}B0`;
      column.style.boxShadow = `inset 0 0 10px 10px ${
        colors[Score % colors.length]
      }A0`;
      let div = document.createElement("div");
      div.style.background = `${colors[Score % colors.length]}B0`;
      div.style.boxShadow = `inset 0 0 10px 10px ${
        colors[Score % colors.length]
      }A0`;
      column.appendChild(div);
      row.appendChild(column);
    }
    gameParams.bricksContainer.appendChild(row);
  }
}

function calculateSizing() {
  aspectRatio =
    gameParams.bricksContainer.clientWidth /
    gameParams.bricksContainer.clientHeight;
  if (aspectRatio > 1) {
    createTable(11, 15);
  } else {
    createTable(16, 8);
  }
}
