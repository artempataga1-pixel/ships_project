'use strict';

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const STATE = {
  board: Array(9).fill(null),
  current: 'X',
  gameOver: false
};

const cells       = document.querySelectorAll('.cell');
const btnP1       = document.getElementById('btn-player1');
const btnP2       = document.getElementById('btn-player2');
const overlay     = document.getElementById('result-overlay');
const resultTitle = document.getElementById('result-title');
const resultSub   = document.getElementById('result-sub');
const newGameBtn  = document.getElementById('new-game-btn');

function buildXMark(idx) {
  return `
    <svg class="mark x-mark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="gx${idx}" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <line class="x-line x-line1"
            x1="15" y1="15" x2="85" y2="85"
            filter="url(#gx${idx})"/>
      <line class="x-line x-line2"
            x1="85" y1="15" x2="15" y2="85"
            filter="url(#gx${idx})"/>
      <g class="cracks" filter="url(#gx${idx})">
        <polyline class="crack" points="50,50 45,32 41,21 38,13"/>
        <polyline class="crack" points="50,50 63,43 74,38 84,29"/>
        <polyline class="crack" points="50,50 57,68 61,79 65,89"/>
        <polyline class="crack" points="50,50 36,58 25,63 15,70"/>
        <polyline class="crack" points="50,50 68,57 76,64 85,73"/>
        <polyline class="crack" points="50,50 33,44 22,47 12,43"/>
        <polyline class="crack" points="50,50 52,70 55,83 50,93"/>
        <polyline class="crack" points="50,50 47,30 43,18 48,9"/>
      </g>
    </svg>`;
}

function buildOMark(idx) {
  return `
    <svg class="mark o-mark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="gr${idx}" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="hg${idx}" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stop-color="#000000"/>
          <stop offset="65%"  stop-color="#1a0000"/>
          <stop offset="100%" stop-color="#3d0000"/>
        </radialGradient>
      </defs>
      <circle class="o-glow-outer" cx="50" cy="50" r="32"/>
      <circle class="o-ring" cx="50" cy="50" r="32"
              fill="none" stroke="#ff4500" stroke-width="5"
              filter="url(#gr${idx})"/>
      <circle class="o-hole" cx="50" cy="50" r="28"
              fill="url(#hg${idx})"/>
      <circle class="o-ember" cx="50" cy="50" r="28"
              stroke="#ff6600" filter="url(#gr${idx})"/>
    </svg>`;
}

function checkWinner() {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (STATE.board[a] && STATE.board[a] === STATE.board[b] && STATE.board[a] === STATE.board[c]) {
      return { player: STATE.board[a], line };
    }
  }
  return null;
}

function highlightWinners(line) {
  line.forEach(i => cells[i].classList.add('winner'));
}

function updateTurnIndicator() {
  btnP1.classList.toggle('active', STATE.current === 'X');
  btnP2.classList.toggle('active', STATE.current === 'O');
}

function endGame(winner) {
  STATE.gameOver = true;
  if (winner) {
    const name = winner === 'X' ? 'Игрок 1' : 'Игрок 2';
    resultTitle.textContent = `${name} побеждает!`;
    resultSub.textContent   = '';
  } else {
    resultTitle.textContent = 'Ничья!';
    resultSub.textContent   = 'Никто не победил';
  }
  setTimeout(() => {
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
  }, 750);
}

function onCellClick(e) {
  const cell  = e.currentTarget;
  const index = parseInt(cell.dataset.index, 10);

  if (STATE.gameOver || STATE.board[index]) return;

  STATE.board[index] = STATE.current;
  cell.classList.add('played');
  cell.innerHTML = STATE.current === 'X' ? buildXMark(index) : buildOMark(index);

  const result = checkWinner();
  if (result) {
    highlightWinners(result.line);
    endGame(result.player);
  } else if (STATE.board.every(Boolean)) {
    endGame(null);
  } else {
    STATE.current = STATE.current === 'X' ? 'O' : 'X';
    updateTurnIndicator();
  }
}

function init() {
  STATE.board    = Array(9).fill(null);
  STATE.current  = 'X';
  STATE.gameOver = false;

  cells.forEach(cell => {
    cell.innerHTML = '';
    cell.classList.remove('played', 'winner');
  });

  updateTurnIndicator();
  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');
}

cells.forEach(cell => cell.addEventListener('click', onCellClick));
newGameBtn.addEventListener('click', init);

init();
