export type Player = 'X' | 'O';
export type CellValue = Player | '';
export type GameStatus = 'playing' | 'win' | 'draw';

export interface GameState {
  /** 9-element array representing the board, index 0–8 left-to-right, top-to-bottom. */
  board: CellValue[];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  /** Indices of the three winning cells; null when no winner yet. */
  winningLine: number[] | null;
}

export interface GameEngine {
  /**
   * Attempt to place the current player's mark at `cellIndex` (0–8).
   * Returns `true` and advances state on a valid move.
   * Returns `false` without mutating state when:
   *   - `cellIndex` is out of bounds (< 0 or > 8)
   *   - the cell is already occupied
   *   - the game is no longer in 'playing' status
   */
  makeMove(cellIndex: number): boolean;

  /** Returns a shallow-cloned snapshot of the current game state. */
  getState(): GameState;

  /** Resets the board to the initial state so a new game can begin. */
  reset(): void;
}

/**
 * All 8 winning combinations: 3 rows, 3 columns, 2 diagonals.
 * Indices refer to board positions 0–8 (left-to-right, top-to-bottom).
 *
 *  0 | 1 | 2
 *  ---------
 *  3 | 4 | 5
 *  ---------
 *  6 | 7 | 8
 */
export const WIN_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], // row 0
  [3, 4, 5], // row 1
  [6, 7, 8], // row 2
  [0, 3, 6], // col 0
  [1, 4, 7], // col 1
  [2, 5, 8], // col 2
  [0, 4, 8], // main diagonal
  [2, 4, 6], // anti-diagonal
];

/**
 * Pure function — checks whether `player` has completed any winning line on `board`.
 * Returns the winning line indices if found, or `null` otherwise.
 */
export function checkWin(
  board: CellValue[],
  player: Player,
): readonly [number, number, number] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] === player && board[b] === player && board[c] === player) {
      return line;
    }
  }
  return null;
}

/**
 * Pure function — returns `true` when all 9 cells are filled (draw condition).
 * Must only be called after confirming no winner exists.
 */
export function checkDraw(board: CellValue[]): boolean {
  return board.every((cell) => cell !== '');
}

function createInitialState(): GameState {
  return {
    board: Array<CellValue>(9).fill(''),
    currentPlayer: 'X',
    status: 'playing',
    winner: null,
    winningLine: null,
  };
}

/**
 * Factory that creates an isolated GameEngine instance.
 * All game state is encapsulated; no global variables are used.
 */
export function createGameEngine(): GameEngine {
  let state: GameState = createInitialState();

  function makeMove(cellIndex: number): boolean {
    if (cellIndex < 0 || cellIndex > 8) return false;
    if (state.status !== 'playing') return false;
    if (state.board[cellIndex] !== '') return false;

    const newBoard = [...state.board] as CellValue[];
    newBoard[cellIndex] = state.currentPlayer;

    const winLine = checkWin(newBoard, state.currentPlayer);

    if (winLine) {
      // Game over — current player wins; do not toggle turn
      state = {
        ...state,
        board: newBoard,
        status: 'win',
        winner: state.currentPlayer,
        winningLine: [...winLine],
      };
    } else if (checkDraw(newBoard)) {
      // Game over — all 9 cells filled, no winner
      state = {
        ...state,
        board: newBoard,
        status: 'draw',
      };
    } else {
      state = {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
      };
    }

    return true;
  }

  function getState(): GameState {
    return { ...state, board: [...state.board] as CellValue[] };
  }

  function reset(): void {
    state = createInitialState();
  }

  return { makeMove, getState, reset };
}
