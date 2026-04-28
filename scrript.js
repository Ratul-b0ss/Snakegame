/**
 * SHADOW_SNAKE - Ultra-Optimized
 */

const board = document.getElementById('game-board');
const scoreElement = document.querySelector("#score");
const timerElement = document.querySelector("#timer");
const highScoreElement = document.querySelector("#hiscore");
const modal = document.getElementById('game-modal');
const [modalTitle, modalMessage] = [document.getElementById('modal-title'), document.getElementById('modal-message')];
const startBtn = document.getElementById('start-btn');

const CELL_SIZE = 25; 
let columns, rows, grid = [];
let snake, food, velocity, gameInterval, timerInterval;
let sc = 0, secondsElapsed = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

highScoreElement.textContent = highScore.toString().padStart(2, '0');

function initBoard() {
    board.innerHTML = '';
    columns = Math.floor(board.clientWidth / CELL_SIZE);
    rows = Math.floor(board.clientHeight / CELL_SIZE);
    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    grid = Array.from({ length: rows }, () => 
        Array.from({ length: columns }, () => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            board.appendChild(cell);
            return cell;
        })
    );
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
    // Clean current state from board
    if (snake) snake.forEach(p => { updateCell(p, 'snake-head', false); updateCell(p, 'snake-body', false); });
    if (food) updateCell(food, 'food', false);

    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    velocity = { x: 1, y: 0 };
    sc = 0;
    secondsElapsed = 0;
    
    scoreElement.textContent = "00";
    timerElement.textContent = "00:00";
    highScoreElement.style.color = "";
    
    // Initial render
    snake.forEach((p, i) => updateCell(p, i === 0 ? 'snake-head' : 'snake-body', true));
    spawnFood();
}

function moveSnake() {
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows || 
        snake.some(p => p.x === head.x && p.y === head.y)) {
        return gameOver(head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows ? "BOUNDARY HIT!" : "SELF COLLISION!");
    }

    // Update old head to body
    updateCell(snake[0], 'snake-head', false);
    updateCell(snake[0], 'snake-body', true);

    snake.unshift(head);
    updateCell(head, 'snake-head', true);

    if (head.x === food.x && head.y === food.y) {
        sc++;
        scoreElement.textContent = sc.toString().padStart(2, '0');
        if (sc > highScore) {
            highScore = sc;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore.toString().padStart(2, '0');
            highScoreElement.style.color = "#fff";
        }
        spawnFood();
    } else {
        const tail = snake.pop();
        updateCell(tail, 'snake-body', false);
    }
}

function startGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    gameInterval = setInterval(moveSnake, 120);
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
    modalTitle.textContent = "GAME OVER";
    modalMessage.innerHTML = `${reason}<br><br>FINAL SCORE: ${sc}`;
    startBtn.textContent = "RESTART GAME";
    modal.style.display = 'flex';
}

window.addEventListener('keydown', e => {
    const moves = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
    const next = moves[e.key];
    if (next && (next.x !== -velocity.x || next.y !== -velocity.y)) velocity = next;
});

startBtn.addEventListener('click', () => { modal.style.display = 'none'; resetGame(); startGame(); });

initBoard();