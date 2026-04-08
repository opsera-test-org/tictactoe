import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine, checkWin, checkDraw, WIN_LINES } from './gameEngine';
import type { GameEngine, CellValue } from './gameEngine';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = createGameEngine();
  });

  // ─── Initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with an empty 9-cell board', () => {
      const { board } = engine.getState();
      expect(board).toHaveLength(9);
      expect(board.every((cell) => cell === '')).toBe(true);
    });

    it('starts with X as the current player', () => {
      expect(engine.getState().currentPlayer).toBe('X');
    });

    it('starts with status "playing"', () => {
      expect(engine.getState().status).toBe('playing');
    });

    it('starts with no winner', () => {
      expect(engine.getState().winner).toBeNull();
    });

    it('starts with no winning line', () => {
      expect(engine.getState().winningLine).toBeNull();
    });

    it('starts with 2 moves remaining this turn', () => {
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
    });
  });

  // ─── getState immutability ─────────────────────────────────────────────────

  describe('getState()', () => {
    it('returns a snapshot — mutating it does not affect engine state', () => {
      const snap = engine.getState();
      snap.board[0] = 'X';
      expect(engine.getState().board[0]).toBe('');
    });
  });

  // ─── makeMove — valid moves ────────────────────────────────────────────────

  describe('makeMove() — valid moves', () => {
    it('returns true for a valid move', () => {
      expect(engine.makeMove(0)).toBe(true);
    });

    it('places X mark on the first move', () => {
      engine.makeMove(0);
      expect(engine.getState().board[0]).toBe('X');
    });

    it('player stays X after the first move (still has one more)', () => {
      engine.makeMove(0);
      expect(engine.getState().currentPlayer).toBe('X');
      expect(engine.getState().movesRemainingThisTurn).toBe(1);
    });

    it('places X mark on the second move (X still has the turn)', () => {
      engine.makeMove(0); // X move 1/2
      engine.makeMove(1); // X move 2/2
      expect(engine.getState().board[1]).toBe('X');
    });

    it('switches to O after X uses both moves', () => {
      engine.makeMove(0); // X 1/2
      engine.makeMove(1); // X 2/2 → O's turn
      expect(engine.getState().currentPlayer).toBe('O');
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
    });

    it('places O mark on O first move', () => {
      engine.makeMove(0); // X 1/2
      engine.makeMove(1); // X 2/2 → O
      engine.makeMove(2); // O 1/2
      expect(engine.getState().board[2]).toBe('O');
      expect(engine.getState().currentPlayer).toBe('O');
    });

    it('switches back to X after O uses both moves', () => {
      engine.makeMove(0); // X 1/2
      engine.makeMove(1); // X 2/2 → O
      engine.makeMove(2); // O 1/2
      engine.makeMove(3); // O 2/2 → X
      expect(engine.getState().currentPlayer).toBe('X');
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
    });

    it('full 9-cell sequence produces pattern X,X,O,O,X,X,O,O,X', () => {
      for (let i = 0; i < 9; i++) engine.makeMove(i);
      const { board } = engine.getState();
      // X at 0,1,4,5,8  — O at 2,3,6,7
      expect(board[0]).toBe('X');
      expect(board[1]).toBe('X');
      expect(board[2]).toBe('O');
      expect(board[3]).toBe('O');
      expect(board[4]).toBe('X');
      expect(board[5]).toBe('X');
      expect(board[6]).toBe('O');
      expect(board[7]).toBe('O');
      expect(board[8]).toBe('X');
    });

    it('accepts the boundary cell index 0', () => {
      expect(engine.makeMove(0)).toBe(true);
    });

    it('accepts the boundary cell index 8', () => {
      expect(engine.makeMove(8)).toBe(true);
    });

    it('does not alter unplayed cells on a valid move', () => {
      engine.makeMove(4);
      const { board } = engine.getState();
      const otherCells = [0, 1, 2, 3, 5, 6, 7, 8];
      otherCells.forEach((i) => expect(board[i]).toBe(''));
    });
  });

  // ─── Two-move turn mechanics ───────────────────────────────────────────────

  describe('two-moves-per-turn mechanics', () => {
    it('movesRemainingThisTurn counts down from 2 to 1 on first move', () => {
      engine.makeMove(0);
      expect(engine.getState().movesRemainingThisTurn).toBe(1);
    });

    it('movesRemainingThisTurn resets to 2 after second move (turn switch)', () => {
      engine.makeMove(0);
      engine.makeMove(1);
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
    });

    it('full turn cycle: X(2) → X(1) → O(2) → O(1) → X(2)', () => {
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
      engine.makeMove(0); // X 1/2
      expect(engine.getState().movesRemainingThisTurn).toBe(1);
      engine.makeMove(1); // X 2/2
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
      engine.makeMove(2); // O 1/2
      expect(engine.getState().movesRemainingThisTurn).toBe(1);
      engine.makeMove(3); // O 2/2
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
      expect(engine.getState().currentPlayer).toBe('X');
    });

    it('a failed move does not decrement movesRemainingThisTurn', () => {
      engine.makeMove(0); // X 1/2 → remaining=1
      engine.makeMove(0); // rejected (occupied)
      expect(engine.getState().movesRemainingThisTurn).toBe(1);
    });

    it('the same player places both consecutive marks', () => {
      engine.makeMove(0); // X
      engine.makeMove(5); // X again
      expect(engine.getState().board[0]).toBe('X');
      expect(engine.getState().board[5]).toBe('X');
    });
  });

  // ─── makeMove — occupied cell rejection ───────────────────────────────────

  describe('makeMove() — occupied cell rejection', () => {
    it('returns false when the target cell is already occupied', () => {
      engine.makeMove(0); // X at 0 (move 1/2, still X)
      expect(engine.makeMove(0)).toBe(false); // X tries same cell again
    });

    it('does not change the board when cell is occupied', () => {
      engine.makeMove(3);
      const boardBefore = engine.getState().board.slice();
      engine.makeMove(3);
      expect(engine.getState().board).toEqual(boardBefore);
    });

    it('does not change movesRemainingThisTurn when cell is occupied', () => {
      engine.makeMove(3); // X 1/2 → remaining=1
      engine.makeMove(3); // rejected
      expect(engine.getState().movesRemainingThisTurn).toBe(1);
    });

    it('returns false for an occupied cell regardless of whose turn it is', () => {
      engine.makeMove(0); // X 1/2
      engine.makeMove(1); // X 2/2 → O
      engine.makeMove(0); // O tries cell 0 (occupied by X) → false
      expect(engine.makeMove(0)).toBe(false);
      engine.makeMove(1); // O tries cell 1 (occupied by X) → false
      expect(engine.makeMove(1)).toBe(false);
    });
  });

  // ─── makeMove — out-of-bounds rejection ───────────────────────────────────

  describe('makeMove() — out-of-bounds index', () => {
    it('returns false for index -1', () => {
      expect(engine.makeMove(-1)).toBe(false);
    });

    it('returns false for index 9', () => {
      expect(engine.makeMove(9)).toBe(false);
    });

    it('returns false for large positive index', () => {
      expect(engine.makeMove(100)).toBe(false);
    });

    it('returns false for large negative index', () => {
      expect(engine.makeMove(-999)).toBe(false);
    });

    it('does not mutate board on out-of-bounds move', () => {
      const boardBefore = engine.getState().board.slice();
      engine.makeMove(-1);
      engine.makeMove(9);
      expect(engine.getState().board).toEqual(boardBefore);
    });

    it('does not change movesRemainingThisTurn on out-of-bounds move', () => {
      engine.makeMove(-1);
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
    });
  });

  // ─── reset() ──────────────────────────────────────────────────────────────

  describe('reset()', () => {
    it('clears all board cells after moves', () => {
      engine.makeMove(0);
      engine.makeMove(4);
      engine.reset();
      expect(engine.getState().board.every((c) => c === '')).toBe(true);
    });

    it('resets current player to X', () => {
      engine.makeMove(0);
      engine.makeMove(1); // both X moves → now O's turn
      engine.reset();
      expect(engine.getState().currentPlayer).toBe('X');
    });

    it('resets movesRemainingThisTurn to 2', () => {
      engine.makeMove(0); // remaining drops to 1
      engine.reset();
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
    });

    it('resets status to "playing"', () => {
      engine.reset();
      expect(engine.getState().status).toBe('playing');
    });

    it('resets winner to null', () => {
      engine.reset();
      expect(engine.getState().winner).toBeNull();
    });

    it('allows new moves after reset', () => {
      engine.makeMove(0);
      engine.makeMove(1);
      engine.reset();
      expect(engine.makeMove(0)).toBe(true);
      expect(engine.getState().board[0]).toBe('X');
    });
  });

  // ─── Multiple independent instances ───────────────────────────────────────

  describe('engine isolation', () => {
    it('two engine instances do not share state', () => {
      const engineA = createGameEngine();
      const engineB = createGameEngine();
      engineA.makeMove(0);
      expect(engineB.getState().board[0]).toBe('');
    });
  });

  // ─── checkWin() pure function ─────────────────────────────────────────────

  describe('checkWin()', () => {
    it('returns null for an empty board', () => {
      const board = Array<CellValue>(9).fill('');
      expect(checkWin(board, 'X')).toBeNull();
      expect(checkWin(board, 'O')).toBeNull();
    });

    it('returns null when only two cells in a line are filled', () => {
      const board = Array<CellValue>(9).fill('');
      board[0] = 'X';
      board[1] = 'X';
      expect(checkWin(board, 'X')).toBeNull();
    });

    it('returns the correct line when all three cells match', () => {
      const board = Array<CellValue>(9).fill('');
      board[0] = 'X';
      board[1] = 'X';
      board[2] = 'X';
      expect(checkWin(board, 'X')).toEqual([0, 1, 2]);
    });

    it('does not return a win for the wrong player on a filled line', () => {
      const board = Array<CellValue>(9).fill('');
      board[0] = 'X';
      board[1] = 'X';
      board[2] = 'X';
      expect(checkWin(board, 'O')).toBeNull();
    });

    it('exports exactly 8 WIN_LINES', () => {
      expect(WIN_LINES).toHaveLength(8);
    });

    it('detects wins on all 8 lines', () => {
      for (const line of WIN_LINES) {
        const board = Array<CellValue>(9).fill('');
        for (const idx of line) board[idx] = 'X';
        expect(checkWin(board, 'X')).toEqual([...line]);
      }
    });
  });

  // ─── checkDraw() pure function ────────────────────────────────────────────

  describe('checkDraw()', () => {
    it('returns false for an empty board', () => {
      const board = Array<CellValue>(9).fill('');
      expect(checkDraw(board)).toBe(false);
    });

    it('returns false when board is partially filled', () => {
      const board = Array<CellValue>(9).fill('');
      board[0] = 'X';
      board[4] = 'O';
      expect(checkDraw(board)).toBe(false);
    });

    it('returns false when one cell remains empty', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', ''];
      expect(checkDraw(board)).toBe(false);
    });

    it('returns true when all 9 cells are filled', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(checkDraw(board)).toBe(true);
    });

    it('returns true even when a full board has a win pattern (no win enforcement)', () => {
      const board: CellValue[] = ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'];
      expect(checkDraw(board)).toBe(true);
    });
  });

  // ─── Draw detection — full game ───────────────────────────────────────────

  describe('draw detection', () => {
    /**
     * With 2-moves-per-turn the sequence is:
     *   X:0, X:1  |  O:2, O:3  |  X:4, X:5  |  O:6, O:7  |  X:8
     * Board:  X X O / O X X / O O X
     */
    function playDrawGame(eng: GameEngine) {
      eng.makeMove(0); // X 1/2
      eng.makeMove(1); // X 2/2 → O
      eng.makeMove(2); // O 1/2
      eng.makeMove(3); // O 2/2 → X
      eng.makeMove(4); // X 1/2
      eng.makeMove(5); // X 2/2 → O
      eng.makeMove(6); // O 1/2
      eng.makeMove(7); // O 2/2 → X
      eng.makeMove(8); // X — 9th move, board full → draw
    }

    it('status is "draw" after all 9 cells are filled', () => {
      playDrawGame(engine);
      expect(engine.getState().status).toBe('draw');
    });

    it('winner is null on draw', () => {
      playDrawGame(engine);
      expect(engine.getState().winner).toBeNull();
    });

    it('winningLine is null on draw', () => {
      playDrawGame(engine);
      expect(engine.getState().winningLine).toBeNull();
    });

    it('all 9 cells are filled on draw', () => {
      playDrawGame(engine);
      expect(engine.getState().board.every((cell) => cell !== '')).toBe(true);
    });

    it('makeMove returns false after a draw', () => {
      playDrawGame(engine);
      expect(engine.makeMove(0)).toBe(false);
    });

    it('board is not mutated after a rejected post-draw move', () => {
      playDrawGame(engine);
      const boardBefore = engine.getState().board.slice();
      engine.makeMove(0);
      expect(engine.getState().board).toEqual(boardBefore);
    });

    it('makeMove returns true on the 9th (draw-completing) move', () => {
      engine.makeMove(0);
      engine.makeMove(1);
      engine.makeMove(2);
      engine.makeMove(3);
      engine.makeMove(4);
      engine.makeMove(5);
      engine.makeMove(6);
      engine.makeMove(7);
      expect(engine.makeMove(8)).toBe(true);
    });
  });

  // ─── reset() after draw ───────────────────────────────────────────────────

  describe('reset() after draw', () => {
    function playDrawGame(eng: GameEngine) {
      [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((i) => eng.makeMove(i));
    }

    it('reset() restores empty board', () => {
      playDrawGame(engine);
      engine.reset();
      expect(engine.getState().board.every((c) => c === '')).toBe(true);
    });

    it('reset() sets status back to "playing"', () => {
      playDrawGame(engine);
      engine.reset();
      expect(engine.getState().status).toBe('playing');
    });

    it('reset() restores currentPlayer to X', () => {
      playDrawGame(engine);
      engine.reset();
      expect(engine.getState().currentPlayer).toBe('X');
    });

    it('reset() restores movesRemainingThisTurn to 2', () => {
      playDrawGame(engine);
      engine.reset();
      expect(engine.getState().movesRemainingThisTurn).toBe(2);
    });

    it('allows a full new game after reset()', () => {
      playDrawGame(engine);
      engine.reset();
      expect(engine.makeMove(0)).toBe(true);
      expect(engine.getState().board[0]).toBe('X');
    });
  });
});
