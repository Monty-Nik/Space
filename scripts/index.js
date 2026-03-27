let grid = [];
const size = 5;
let timerId = null;
let timeLeft = 120;
let playerName = "";

const pipeTypes = {
    'line':   [1, 0, 1, 0],
    'angle':  [1, 1, 0, 0],
    'tshape': [1, 1, 1, 0],
    'cross':  [1, 1, 1, 1]
};

function checkName() {
    const input = document.getElementById('username');
    const btn = document.getElementById('btn-start');
    btn.disabled = input.value.length === 0;
}

function startGame() {
    const input = document.getElementById('username');
    playerName = input.value;
    document.getElementById('screen-start').style.display = 'none';
    document.getElementById('screen-end').style.display = 'none';
    document.getElementById('screen-game').style.display = 'block';
    timeLeft = 120;
    createLevel();
    startTimer();
}

function startTimer() {
    if (timerId !== null) clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft -= 1;
        document.getElementById('score').innerText = timeLeft;
        document.getElementById('timer').innerText = formatTime(timeLeft);
        if (timeLeft <= 0) finishGame(false);
    }, 1000);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `0${m}:${s < 10 ? '0' + s : s}`;
}

function createLevel() {
    const container = document.getElementById('game-field');
    container.innerHTML = "";
    grid = [];
    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) {
            const keys = ['line', 'angle', 'tshape', 'line', 'angle'];
            let randType = keys[Math.floor(Math.random() * keys.length)];
            const isStart = (r === 0 && c === 0);
            const isEnd = (r === 4 && c === 4);
            if (isStart || isEnd) randType = 'angle';
            const cell = {
                type: randType,
                rotation: Math.floor(Math.random() * 4),
                div: null
            };
            const div = document.createElement('div');
            div.className = 'cell';
            if (isStart) div.classList.add('pipe-start');
            if (isEnd) div.classList.add('pipe-end');
            div.innerHTML = getSvgCode(cell.type);
            div.style.transform = `rotate(${cell.rotation * 90}deg)`;
            div.onclick = () => clickPipe(r, c);
            cell.div = div;
            row.push(cell);
            container.appendChild(div);
        }
        grid.push(row);
    }
}

function clickPipe(r, c) {
    const cell = grid[r][c];
    cell.rotation = (cell.rotation + 1) % 4;
    cell.div.style.transform = `rotate(${cell.rotation * 90}deg)`;
    checkWin();
}

function checkWin() {
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const startOpenings = getOpenings(0, 0);
    if (startOpenings[0] === 0) return;
    const win = findPath(0, 0, visited, null);
    if (win) {
        const endOpenings = getOpenings(size - 1, size - 1);
        if (endOpenings[2] === 1) setTimeout(() => finishGame(true), 300);
    }
}

function findPath(r, c, visited, fromDirection) {
    if (r < 0 || c < 0 || r >= size || c >= size) return false;
    if (visited[r][c]) return false;
    const openings = getOpenings(r, c);
    if (fromDirection !== null && openings[fromDirection] === 0) return false;
    if (r === size - 1 && c === size - 1) return true;
    visited[r][c] = true;
    if (openings[0] === 1 && findPath(r - 1, c, visited, 2)) return true;
    if (openings[1] === 1 && findPath(r, c + 1, visited, 3)) return true;
    if (openings[2] === 1 && findPath(r + 1, c, visited, 0)) return true;
    if (openings[3] === 1 && findPath(r, c - 1, visited, 1)) return true;
    visited[r][c] = false;
    return false;
}

function getOpenings(r, c) {
    const cell = grid[r][c];
    const base = pipeTypes[cell.type];
    const rot = cell.rotation;
    const result = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) result[(i + rot) % 4] = base[i];
    return result;
}

function finishGame(isWin) {
    clearInterval(timerId);
    document.getElementById('screen-game').style.display = 'none';
    document.getElementById('screen-end').style.display = 'block';
    const title = document.getElementById('end-title');
    const msg = document.getElementById('end-message');
    const scoreSpan = document.getElementById('final-score');
    const timeSpan = document.getElementById('final-time');
    const timeSpentSeconds = 120 - timeLeft;
    if (isWin) {
        title.innerText = "ПОБЕДА!";
        title.style.color = "#0aff60";
        msg.innerText = `Поздравляем, ${playerName}! Вы восстановили подачу воздуха.`;
        scoreSpan.innerText = timeLeft;
        timeSpan.innerText = formatTime(timeSpentSeconds);
    } else {
        title.innerText = "ПРОВАЛ";
        title.style.color = "#ff003c";
        msg.innerText = "Время вышло. Разгерметизация критическая.";
        scoreSpan.innerText = "0";
        timeSpan.innerText = "02:00";
    }
}

function restartGame() {
    startGame();
}

function getSvgCode(type) {
    const color = 'fill="currentColor"';
    if (type === 'line') return `<svg viewBox="0 0 100 100"><rect x="35" y="0" width="30" height="100" rx="10" ${color}/></svg>`;
    if (type === 'angle') return `<svg viewBox="0 0 100 100"><path d="M35 0 V50 A15 15 0 0 0 50 65 H100 V35 H50 A15 15 0 0 1 65 20 V0 Z" ${color}/></svg>`;
    if (type === 'tshape') return `<svg viewBox="0 0 100 100"><rect x="35" y="0" width="30" height="100" rx="5" ${color}/><rect x="50" y="35" width="50" height="30" rx="5" ${color}/></svg>`;
    if (type === 'cross') return `<svg viewBox="0 0 100 100"><rect x="35" y="0" width="30" height="100" rx="5" ${color}/><rect x="0" y="35" width="100" height="30" rx="5" ${color}/></svg>`;
    return '';
}

window.onload = () => checkName();