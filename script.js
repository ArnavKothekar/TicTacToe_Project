document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');
  const status = document.getElementById('status');
  const resetBtn = document.getElementById('resetBtn');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const scoreX = document.getElementById('score-x');
  const scoreO = document.getElementById('score-o');
  const body = document.body;

  let currentPlayer = 'X';
  let gameActive = true;
  let gameState = Array(9).fill('');
  let scores = { X: 0, O: 0 };
  let winTimeout = null;
  let starter = 'X'; // Tracks who should start the next game

  // Local Storage Keys
  const STORAGE_KEY = 'tictactoe-state-v1';

  function saveState() {
    const state = {
      currentPlayer,
      gameActive,
      gameState,
      scores,
      starter
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    const stateStr = localStorage.getItem(STORAGE_KEY);
    if (!stateStr) return;
    try {
      const state = JSON.parse(stateStr);
      if (!state) return;
      if (Array.isArray(state.gameState) && state.gameState.length === 9) {
        gameState = state.gameState;
        gameState.forEach((val, idx) => {
          cells[idx].textContent = val;
          cells[idx].classList.remove('x', 'o');
          if (val === 'X' || val === 'O') {
            cells[idx].classList.add(val.toLowerCase());
          }
        });
      }
      if (state.scores && typeof state.scores.X === 'number' && typeof state.scores.O === 'number') {
        scores = state.scores;
        updateScores();
      }
      if (state.currentPlayer === 'X' || state.currentPlayer === 'O') {
        currentPlayer = state.currentPlayer;
      }
      if (typeof state.gameActive === 'boolean') {
        gameActive = state.gameActive;
      }
      if (state.starter === 'X' || state.starter === 'O') {
        starter = state.starter;
      }
      // If game is not active, check for winner and highlight
      if (!gameActive) {
        const winner = getWinner();
        if (winner) highlightWin();
      }
      if (gameActive) {
        setStatusText(`Player ${currentPlayer}'s turn`, currentPlayer);
      } else {
        const winner = getWinner();
        if (winner) {
          setStatusText(`Player ${winner} wins!`, winner);
        } else {
          setStatusText("It's a draw!", currentPlayer);
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  function setStatusText(text, player) {
    if (player === 'X') {
      status.innerHTML = text.replace('X', '<span class="player-x">X</span>');
      body.classList.add('bg-x');
      body.classList.remove('bg-o');
    } else if (player === 'O') {
      status.innerHTML = text.replace('O', '<span class="player-o">O</span>');
      body.classList.add('bg-o');
      body.classList.remove('bg-x');
    } else {
      status.textContent = text;
    }
  }

  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  function highlightDraw() {
    cells.forEach(cell => {
      cell.style.background = '#e0e0e0';
    });
  }

  function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));
    if (!gameActive || gameState[index]) return;

    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    const winner = getWinner();
    if (winner) {
      setStatusText(`Player ${winner} wins!`, winner);
      gameActive = false;
      highlightWin();
      scores[winner]++;
      updateScores();
      // Loser starts next round
      starter = winner === 'X' ? 'O' : 'X';
      saveState();
      winTimeout = setTimeout(() => {
        resetBoardOnly();
        saveState();
      }, 1500);
      return;
    }
    if (gameState.every(cell => cell)) {
      setStatusText("It's a draw!", currentPlayer);
      gameActive = false;
      // Switch starter after draw
      starter = starter === 'X' ? 'O' : 'X';
      highlightDraw();
      saveState();
      winTimeout = setTimeout(() => {
        resetBoardOnly();
        saveState();
      }, 1500);
      return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setStatusText(`Player ${currentPlayer}'s turn`, currentPlayer);
    saveState();
  }

  function getWinner() {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        gameState[a] &&
        gameState[a] === gameState[b] &&
        gameState[a] === gameState[c]
      ) {
        return gameState[a];
      }
    }
    return null;
  }

  function highlightWin() {
    winPatterns.forEach(pattern => {
      const [a, b, c] = pattern;
      if (
        gameState[a] &&
        gameState[a] === gameState[b] &&
        gameState[a] === gameState[c]
      ) {
        cells[a].style.background = '#d4edda';
        cells[b].style.background = '#d4edda';
        cells[c].style.background = '#d4edda';
      }
    });
  }

  function updateScores() {
    scoreX.textContent = `X: ${scores.X}`;
    scoreO.textContent = `O: ${scores.O}`;
  }

  function resetBoardOnly() {
    gameState = Array(9).fill('');
    currentPlayer = starter;
    gameActive = true;
    setStatusText(`Player ${currentPlayer}'s turn`, currentPlayer);
    cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('x', 'o');
      cell.style.background = '';
    });
    winTimeout = null;
    saveState();
  }

  function resetGame() {
    if (winTimeout) clearTimeout(winTimeout);
    scores = { X: 0, O: 0 };
    updateScores();
    starter = 'X';
    resetBoardOnly();
    saveState();
  }

  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
  resetBtn.addEventListener('click', resetGame);

  // On load, restore state
  loadState();
});
