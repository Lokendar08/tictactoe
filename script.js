const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const aiToggleBtn = document.getElementById('ai-toggle');

let board, currentPlayer, gameActive, aiMode;
const WINNING_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],  // rows
  [0,3,6],[1,4,7],[2,5,8],  // cols
  [0,4,8],[2,4,6]           // diags
];

function initGame() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  renderBoard();
  setStatus(`Player ${currentPlayer}'s turn`);
  clearWinner();
}

function renderBoard() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    let cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.idx = i;
    cell.textContent = board[i];
    cell.addEventListener('click', cellClick);
    boardEl.appendChild(cell);
  }
}

function cellClick(e) {
  const idx = +e.target.dataset.idx;
  if (!gameActive || board[idx]) return;
  board[idx] = currentPlayer;
  updateCell(idx);
  if (checkWin(currentPlayer)) {
    highlightWinner(checkWin(currentPlayer));
    setStatus(`Player ${currentPlayer} wins!`);
    gameActive = false;
    return;
  }
  if (board.every(cell => cell)) {
    setStatus("It's a Draw!");
    gameActive = false;
    return;
  }
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  setStatus(`Player ${currentPlayer}'s turn`);
  if (aiMode && gameActive && currentPlayer === 'O') {
    setTimeout(aiMove, 450);
  }
}

function updateCell(idx) {
  const cell = boardEl.querySelector(`[data-idx="${idx}"]`);
  cell.textContent = board[idx];
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

function checkWin(player) {
  for (let combo of WINNING_COMBOS) {
    if (combo.every(idx => board[idx] === player)) {
      return combo;
    }
  }
  return null;
}

function highlightWinner(combo) {
  for (let idx of combo) {
    boardEl.querySelector(`[data-idx="${idx}"]`).classList.add('winner');
  }
}

function clearWinner() {
  document.querySelectorAll('.cell.winner').forEach(cell => cell.classList.remove('winner'));
}

restartBtn.addEventListener('click', initGame);

aiToggleBtn.addEventListener('click', () => {
  aiMode = !aiMode;
  aiToggleBtn.textContent = `Play vs AI: ${aiMode ? 'ON' : 'OFF'}`;
  aiToggleBtn.classList.toggle('ai-on', aiMode);
  initGame();
});

// Simple AI: win, block, or random
function aiMove() {
  // Try to win
  let move = findBestMove('O');
  // Block X if needed
  if (move === null) move = findBestMove('X');
  // Else random
  if (move === null) move = randomMove();
  if (move !== null) {
    board[move] = 'O';
    updateCell(move);
    if (checkWin('O')) {
      highlightWinner(checkWin('O'));
      setStatus('Player O wins!');
      gameActive = false;
      return;
    }
    if (board.every(cell => cell)) {
      setStatus("It's a Draw!");
      gameActive = false;
      return;
    }
    currentPlayer = 'X';
    setStatus(`Player ${currentPlayer}'s turn`);
  }
}

function findBestMove(player) {
  for (let combo of WINNING_COMBOS) {
    let cells = combo.map(idx => board[idx]);
    if (cells.filter(x => x === player).length === 2 && cells.includes('')) {
      return combo[cells.indexOf('')];
    }
  }
  return null;
}
function randomMove() {
  let empty = board.map((v, i) => v ? null : i).filter(i => i !== null);
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

// Start with AI off
aiMode = false;
initGame();
