export type Player = 'X' | 'O';
export type CellValue = Player | '';
export type GameStatus = 'playing' | 'draw';

export interface GameState {
  /** 9-element array representing the board, index 0–8 left-to-right, top-to-bottom. */
  board: CellValue[];
  currentPlayer: Player;
  status: GameStatus;
  winner: null;
  /** Always null — this game has no win condition. */
  winningLine: null;
  /**
   * Moves the current player still has left in their turn.
   * Each player gets 2 consecutive moves before the turn passes to the other.
   * Value is 2 at the start of a turn; drops to 1 after the first move; resets
   * to 2 when the second move is played and the turn passes to the next player.
   */
  movesRemainingThisTurn: number;
}

export interface GameEngine {
  /**
   * Attempt to place the current player's mark at `cellIndex` (0–8).
   * Returns `true` and advances state on a valid move.
   * Returns `false` without mutating state when:
   *   - `cellIndex` is out of bounds (< 0 or > 8)
   *   - the cell is already occupied
   *   - the game is no longer in 'playing' status (draw)
   */
  makeMove(cellIndex: number): boolean;

  /** Returns a shallow-cloned snapshot of the current game state. */
  getState(): GameState;

  /** Resets the board to the initial state so a new game can begin. */
  reset(): void;
}

/**
 * All 8 winning combinations (kept as a reference utility even though this
 * game does not enforce a win condition).
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
 * Pure utility — checks whether `player` has completed any winning line on
 * `board`. Not used by makeMove in this no-winner variant, but exported for
 * external use and testing.
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
    movesRemainingThisTurn: 2,
  };
}

/**
 * Factory that creates an isolated GameEngine instance.
 * Turn order: each player makes 2 consecutive moves before the turn passes.
 * The game ends only when all 9 cells are filled (draw — there is no winner).
 */
export function createGameEngine(): GameEngine {
  let state: GameState = createInitialState();

  function makeMove(cellIndex: number): boolean {
    if (cellIndex < 0 || cellIndex > 8) return false;
    if (state.status !== 'playing') return false;
    if (state.board[cellIndex] !== '') return false;

    const newBoard = [...state.board] as CellValue[];
    newBoard[cellIndex] = state.currentPlayer;

    if (checkDraw(newBoard)) {
      state = { ...state, board: newBoard, status: 'draw' };
      return true;
    }

    const newMovesRemaining = state.movesRemainingThisTurn - 1;
    if (newMovesRemaining === 0) {
      // Current player used both moves — pass turn to the other player
      state = {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
        movesRemainingThisTurn: 2,
      };
    } else {
      // Current player still has one more move this turn
      state = { ...state, board: newBoard, movesRemainingThisTurn: newMovesRemaining };
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
