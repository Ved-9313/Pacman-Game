const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const gameOverText = document.getElementById("game-over");

let mazeTemplate = [
  ['#','#','#','#','#','#','#','#','#','#','#'],
  ['#','.','.','.','#','.','.','.','.','.','#'],
  ['#','.','#','.','#','.','#','#','#','.','#'],
  ['#','.','#','.','.','.','.','.','#','.','#'],
  ['#','.','#','#','#','#','.','#','#','.','#'],
  ['#','.','.','.','.','.','.','.','#','.','#'],
  ['#','.','#','#','#','#','.','#','#','.','#'],
  ['#','.','#','.','.','.','.','.','#','.','#'],
  ['#','.','#','.','#','.','#','#','#','.','#'],
  ['#','.','.','.','#','.','.','.','.','.','#'],
  ['#','#','#','#','#','#','#','#','#','#','#']
];

let maze;
let pacman;
let ghosts;
let score = 0;
let level = 1;
let lives = 3;
let gameActive = true;
let ghostInterval;
let ghostSpeed = 600;

function resetGameState() {
  maze = mazeTemplate.map(row => [...row]);
  pacman = { x: 1, y: 1 };
  ghosts = [
    { x: 9, y: 9, class: "ghost1" },
    { x: 9, y: 1, class: "ghost2" },
    { x: 1, y: 9, class: "ghost3" },
    { x: 5, y: 5, class: "ghost4" }
  ];
}

function drawMaze() {
  if (!gameActive) return;

  gameBoard.innerHTML = "";
  let remainingDots = 0;

  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      const cell = document.createElement("div");

      if (maze[row][col] === "#") {
        cell.classList.add("wall");
      } else if (maze[row][col] === ".") {
        cell.classList.add("dot");
        remainingDots++;
      }

      if (row === pacman.y && col === pacman.x) {
        cell.classList.add("pacman");
      }

      ghosts.forEach(g => {
        if (row === g.y && col === g.x) {
          cell.classList.add("ghost", g.class);
        }
      });

      gameBoard.appendChild(cell);
    }
  }

  if (remainingDots === 0) {
    nextLevel();
  }
}

document.addEventListener("keydown", (event) => {
  if (!gameActive) return;

  let newX = pacman.x, newY = pacman.y;

  switch (event.key) {
    case "ArrowUp": newY--; break;
    case "ArrowDown": newY++; break;
    case "ArrowLeft": newX--; break;
    case "ArrowRight": newX++; break;
  }

  if (maze[newY][newX] !== "#") {
    if (maze[newY][newX] === ".") {
      score += 10;
      maze[newY][newX] = " ";
    }
    pacman.x = newX;
    pacman.y = newY;
  }

  updateScoreDisplay();
  checkCollision();
  drawMaze();
});

function moveGhosts() {
  if (!gameActive) return;

  ghosts.forEach(ghost => {
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    const possibleMoves = directions
      .map(dir => {
        const newX = ghost.x + dir.x;
        const newY = ghost.y + dir.y;
        return {
          ...dir,
          newX,
          newY,
          distance: Math.abs(pacman.x - newX) + Math.abs(pacman.y - newY)
        };
      })
      .filter(move =>
        maze[move.newY][move.newX] !== "#" &&
        !(move.newX === ghost.x && move.newY === ghost.y)
      );

    if (possibleMoves.length > 0) {
      possibleMoves.sort((a, b) => a.distance - b.distance);
      const bestMove = possibleMoves[0];
      ghost.x += bestMove.x;
      ghost.y += bestMove.y;
    }
  });

  checkCollision();
  drawMaze();
}

function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${score} | Level: ${level}`;
}

function updateLivesDisplay() {
  const heart = '❤️';
  document.getElementById("lives").textContent = `Lives: ${heart.repeat(lives)}`;
}


function checkCollision() {
  for (let ghost of ghosts) {
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
      lives--;
      updateLivesDisplay();
      if (lives > 0) {
        resetGameState();
        drawMaze();
      } else {
        gameOver("Game Over! You were caught by a ghost.");
      }
      break;
    }
  }
}

function nextLevel() {
  level++;
  ghostSpeed = Math.max(150, ghostSpeed - 100);
  clearInterval(ghostInterval);

  resetGameState();
  updateScoreDisplay();
  updateLivesDisplay();
  drawMaze();

  ghostInterval = setInterval(moveGhosts, ghostSpeed);
}

function gameOver(message) {
  gameActive = false;
  gameOverText.textContent = message;
  gameOverText.classList.remove("hidden");

  clearInterval(ghostInterval);
  setTimeout(() => location.reload(), 3000);
}

// Start game
resetGameState();
updateScoreDisplay();
updateLivesDisplay();
drawMaze();
ghostInterval = setInterval(moveGhosts, ghostSpeed);
