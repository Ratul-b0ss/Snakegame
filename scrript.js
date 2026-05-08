const board = document.getElementById('game-board');
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const highScoreElement = document.getElementById("hiscore");
const modal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const startBtn = document.getElementById('start-btn');
const diffDropdown = document.getElementById('diff');

const CELL_SIZE = 25; 
let columns, rows, grid = [];
let snake, food, velocity, gameInterval, timerInterval;
let score = 0, secondsElapsed = 0;
let snakeSpeed = 150; 
let highScore = localStorage.getItem('snakeHighScore') || 0;

highScoreElement.textContent = highScore.toString().padStart(2, '0');

// 1. New Helper to sync speed without logic errors
function updateSpeedFromDropdown() {
    const val = diffDropdown.value;
    if (val === "Easy") snakeSpeed = 220;
    else if (val === "Medium") snakeSpeed = 150;
    else if (val === "Hard") snakeSpeed = 80;
}

function initBoard() {
    board.innerHTML = '';
    const cols = Math.floor(board.clientWidth / CELL_SIZE);
    const rows = Math.floor(board.clientHeight / CELL_SIZE);
    const totalCells = cols * rows;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        board.appendChild(cell);
        grid.push(cell);
    }
}

const updateCell = (pos, className, add = true) => {
    if (grid[pos.y] && grid[pos.y][pos.x]) {
        grid[pos.y][pos.x].classList[add ? 'add' : 'remove'](className);
    }
};

function spawnFood() {
    if (food) updateCell(food, 'food', false);
    do {
        food = { x: Math.floor(Math.random() * columns), y: Math.floor(Math.random() * rows) };
    } while (snake.some(p => p.x === food.x && p.y === food.y));
    updateCell(food, 'food', true);
}

function resetGame() {
    if (snake) snake.forEach(p => { 
        updateCell(p, 'snake-head', false); 
        updateCell(p, 'snake-body', false); 
    });
    if (food) updateCell(food, 'food', false);

    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    velocity = { x: 1, y: 0 };
    score = 0;
    secondsElapsed = 0;
    scoreElement.textContent = "00";
    timerElement.textContent = "00:00";
    
    // Ensure speed is correct before starting
    updateSpeedFromDropdown();
    
    snake.forEach((p, i) => updateCell(p, i === 0 ? 'snake-head' : 'snake-body', true));
    spawnFood();
}

function moveSnake() {
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows || 
        snake.some(p => p.x === head.x && p.y === head.y)) {
        return gameOver(head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows ? "BOUNDARY HIT" : "COLLISION");
    }

    updateCell(snake[0], 'snake-head', false);
    updateCell(snake[0], 'snake-body', true);
    snake.unshift(head);
    updateCell(head, 'snake-head', true);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score.toString().padStart(2, '0');
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore.toString().padStart(2, '0');
        }
        spawnFood();
    } else {
        const tail = snake.pop();
        updateCell(tail, 'snake-body', false);
    }
}

// Fixed: Difficulty only changes when user interacts with dropdown
diffDropdown.addEventListener('change', () => {
    updateSpeedFromDropdown();
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = setInterval(moveSnake, snakeSpeed);
    }
});

function startGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    
    updateSpeedFromDropdown(); // Final check before start
    
    gameInterval = setInterval(moveSnake, snakeSpeed);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (secondsElapsed % 60).toString().padStart(2, '0');
        timerElement.textContent = `${mins}:${secs}`;
    }, 1000);
}

function gameOver(reason) {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    gameInterval = null;
    modalTitle.textContent = "GAME OVER";
    modalMessage.innerHTML = `${reason}<br><br>SCORE: ${score}`;
    startBtn.textContent = "RESTART";
    modal.style.display = 'flex';
}

// Arrow keys only handle velocity now
window.addEventListener('keydown', e => {
    const moves = { 
        ArrowUp: { x: 0, y: -1 }, 
        ArrowDown: { x: 0, y: 1 }, 
        ArrowLeft: { x: -1, y: 0 }, 
        ArrowRight: { x: 1, y: 0 } 
    };
    const next = moves[e.key];
    if (next && (next.x !== -velocity.x || next.y !== -velocity.y)) {
        velocity = next;
    }
});

startBtn.addEventListener('click', () => { 
    modal.style.display = 'none'; 
    resetGame(); 
    startGame(); 
});

initBoard();
updateSpeedFromDropdown(); // Initialize speed on page load
window.addEventListener('resize', initBoard);
