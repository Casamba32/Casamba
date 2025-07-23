const canvas = document.getElementById('tetriscanvas');
const ctx = canvas.getContext('2d');
canvas.width = 300;
canvas.height = 600;

const rows = 20;
const BLOCK_SIZE = 30;
const cols = 10;
canvas.width = cols * BLOCK_SIZE;
canvas.height = rows * BLOCK_SIZE;

const TETROMINOS = [
    {color: 'cyan', shape: [[1, 1, 1, 1]]},
    {color: 'blue', shape: [[1, 1], [1, 1]]},
    {color: 'orange', shape: [[1, 1, 1], [1, 0, 0]]},
    {color: 'yellow', shape: [[1, 1,1], [0, 0, 1]]},
    {color: 'green', shape: [[1, 1, 0], [0, 1, 1]]},
    {color: 'purple', shape: [[0, 1, 0], [  1, 1, 1]]},
    {color: 'red', shape: [[0, 1, 1], [1, 1, 1]]}
];

let board = Array.from({length: rows}, () => Array(cols).fill(null));
let currentTetromino = getRandamTetromino();
let currentPosition = {x: 3, y: 0};
let score = 0;
let gameOver = false;
let interval = 400;
let speedIncreaseInterval = 10000;
let lastSpeedIncrease = Date.now();

function getRandamTetromino() {
    return TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
}
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x]) {
               drawBlock(x, y, board[y][x]);
            }
        }
    }
}

function drawTetromino() {
    const shape = currentTetromino.shape;
    const color = currentTetromino.color;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                drawBlock(currentPosition.x + x, currentPosition.y + y, color);
            }
        }
    }
}

function hasCollision(Xoffset, Yoffset) {
    const shape = currentTetromino.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (
                shape[y][x] && (
                    currentPosition.x + x + Xoffset < 0 ||
                    currentPosition.x + x + Xoffset >= cols ||
                    currentPosition.y + y + Yoffset >= rows ||
                    board[currentPosition.y + y + Yoffset][currentPosition.x + x + Xoffset]
                )
            ) {
                return true;
            }
        }
    }
    return false;
}
function mergeTetromino() {
    const shape = currentTetromino.shape;
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                board[currentPosition.y + y][currentPosition.x + x] = currentTetromino.color;
            }
        }
    }
}

function removeRows(){
    let lineremoved = 0;
    for (let y = rows - 1; y >= 0; y--) {
        if (board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(cols).fill(null));
            lineremoved++;
        }
    }
    score += lineremoved * 100; // Fixed: use lineremoved, not lineremove
    document.getElementById('score').innerText = `Score: ${score}`;
}

function rotateTetromino() {
    const shape = currentTetromino.shape;
    const newShape = shape[0].map((_, index) => shape.map(row => row[index]).reverse());
    const originalShape = currentTetromino.shape;
    currentTetromino.shape = newShape;

    if (hasCollision(0, 0)) {
        currentTetromino.shape = originalShape; // Revert rotation if collision
    }
}

function moveDown() {
    if (!hasCollision(0, 1)) {
        currentPosition.y++;
    } else {
        mergeTetromino();
        removeRows();
        currentTetromino = getRandamTetromino();
        currentPosition = {x: 3, y: 0};
        if (hasCollision(0, 0)) {
         gameOver = true;
    // Show overlay instead of alert
         document.getElementById('gameOverOverlay').style.display = 'flex';
         document.getElementById('finalScore').innerText = `Your score: ${score}`;
       }
    }
}

function move(offsetX){
    if (!hasCollision(offsetX, 0)) {
        currentPosition.x += offsetX;
    }
}
function increaseSpeed() {
const now = Date.now();
    if (now - lastSpeedIncrease >= speedIncreaseInterval) {
        interval = Math.max(100, interval - 50); // Minimum interval of 100ms
        lastSpeedIncrease = now;
        interval = Math.max(500, interval - 20);
    }
}

function gameLoop() {
    if (gameOver) return;

    drawBoard();
    drawTetromino();
    moveDown();

    setTimeout(gameLoop, interval);
}

document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    switch (event.key) {
        case 'ArrowLeft':
            move(-1);
            break;
        case 'ArrowRight':
            move(1);
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            rotateTetromino();
            break;
    }
}); // <-- This closes the event listener function and call

document.getElementById('restartButton').addEventListener('click', () => {
    board = Array.from({length: rows}, () => Array(cols).fill(null));
    currentTetromino = getRandamTetromino();
    currentPosition = {x: 3, y: 0};
    score = 0;
    gameOver = false;
    interval = 1000;

    document.getElementById('gameOverOverlay').style.display = 'none';
    document.getElementById('score').innerText = `Score: ${score}`;
    lastSpeedIncrease = Date.now();
    gameLoop();
});


gameLoop();