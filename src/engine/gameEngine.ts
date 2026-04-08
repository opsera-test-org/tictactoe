export type Player = 'X' | 'O';
export type CellValue = Player | '';
export type GameStatus = 'playing' | 'win' | 'draw';

export interface GameState {
  /** 9-element array representing the board, index 0–8 left-to-right, top-to-bottom. */
  board: CellValue[];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  /** Indices of the three winning cells; null when no winner yet. Set by win detection (WO-005). */
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

  /** Resets the board to the initial state so a new game can begin. Added in WO-006. */
  reset(): void;
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

    state = {
      ...state,
      board: newBoard,
      currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    };

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
