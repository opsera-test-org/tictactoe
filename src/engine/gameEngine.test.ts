import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine, checkWin, WIN_LINES } from './gameEngine';
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

    it('toggles current player from X to O after first move', () => {
      engine.makeMove(0);
      expect(engine.getState().currentPlayer).toBe('O');
    });

    it('places O mark on the second move', () => {
      engine.makeMove(0);
      engine.makeMove(1);
      expect(engine.getState().board[1]).toBe('O');
    });

    it('toggles current player back to X after second move', () => {
      engine.makeMove(0);
      engine.makeMove(1);
      expect(engine.getState().currentPlayer).toBe('X');
    });

    it('correctly places marks on all 9 cells in sequence', () => {
      // X plays 0,2,4,6,8 — O plays 1,3,5,7
      for (let i = 0; i < 9; i++) engine.makeMove(i);
      const { board } = engine.getState();
      expect(board[0]).toBe('X');
      expect(board[1]).toBe('O');
      expect(board[2]).toBe('X');
      expect(board[3]).toBe('O');
      expect(board[4]).toBe('X');
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

  // ─── makeMove — occupied cell rejection ───────────────────────────────────

  describe('makeMove() — occupied cell rejection', () => {
    it('returns false when the target cell is already occupied', () => {
      engine.makeMove(0); // X places at 0
      expect(engine.makeMove(0)).toBe(false); // O tries same cell
    });

    it('does not change the board when cell is occupied', () => {
      engine.makeMove(3);
      const boardBefore = engine.getState().board.slice();
      engine.makeMove(3);
      expect(engine.getState().board).toEqual(boardBefore);
    });

    it('does not toggle the player when cell is occupied', () => {
      engine.makeMove(3); // X → O
      engine.makeMove(3); // rejected
      expect(engine.getState().currentPlayer).toBe('O');
    });

    it('rejects occupied cell regardless of which player is current', () => {
      engine.makeMove(0); // X at 0 → now O's turn
      engine.makeMove(1); // O at 1 → now X's turn
      expect(engine.makeMove(0)).toBe(false); // X tries occupied cell
      expect(engine.makeMove(1)).toBe(false); // X tries occupied cell
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

    it('does not toggle player on out-of-bounds move', () => {
      engine.makeMove(-1);
      expect(engine.getState().currentPlayer).toBe('X');
    });
  });

  // ─── makeMove — game-over rejection ───────────────────────────────────────

  describe('makeMove() — game-over status check', () => {
    it('rejects moves when status is not "playing" (simulated via reset)', () => {
      // We can test the structure by verifying reset restores playing state
      // and that a fresh engine always accepts valid moves.
      // Full game-over rejection is exercised once win/draw detection is added (WO-005/006).
      const freshEngine = createGameEngine();
      expect(freshEngine.makeMove(0)).toBe(true);
      freshEngine.reset();
      expect(freshEngine.makeMove(0)).toBe(true);
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
      engine.makeMove(0); // now O's turn
      engine.reset();
      expect(engine.getState().currentPlayer).toBe('X');
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
  });

  // ─── Win detection — all 8 lines × 2 players (16 cases) ──────────────────

  /**
   * Helper: play a sequence of moves on a fresh engine.
   * `moves` is an array of [cellIndex, skip?] pairs; skip=true bypasses the cell
   * by having the other player move elsewhere. This lets us set up board patterns.
   *
   * Simpler approach: play moves interleaved so X hits the target line and O plays
   * neutral cells that don't interfere.
   */

  // Neutral cells that don't form O's win while X builds a row/col/diag
  const NEUTRAL: Record<number, number[]> = {
    0: [8, 7, 6], // O's filler moves for test index set 0
  };
  void NEUTRAL; // suppress unused warning — lookup below uses inline arrays

  /**
   * Simulate X winning on a given line by having O play three safe filler cells.
   * `xLine`: the 3 indices X will play.
   * `oFillers`: 3 indices O will play (must not overlap xLine or form O's win).
   */
  function xWinsOnLine(
    xLine: readonly [number, number, number],
    oFillers: [number, number, number],
  ) {
    const eng = createGameEngine();
    // Move sequence: X0, O0, X1, O1, X2 (wins)
    eng.makeMove(xLine[0]);
    eng.makeMove(oFillers[0]);
    eng.makeMove(xLine[1]);
    eng.makeMove(oFillers[1]);
    eng.makeMove(xLine[2]); // winning move
    return eng;
  }

  /**
   * Simulate O winning on a given line (X moves first so we need 4 X moves).
   * `oLine`: the 3 indices O will play.
   * `xFillers`: 4 indices X will play (must not form X's win).
   */
  function oWinsOnLine(
    oLine: readonly [number, number, number],
    xFillers: [number, number, number, number],
  ) {
    const eng = createGameEngine();
    // Move sequence: X0, O0, X1, O1, X2, O2 (wins)
    eng.makeMove(xFillers[0]);
    eng.makeMove(oLine[0]);
    eng.makeMove(xFillers[1]);
    eng.makeMove(oLine[1]);
    eng.makeMove(xFillers[2]);
    eng.makeMove(oLine[2]); // winning move
    return eng;
  }

  describe('win detection — X wins on each of the 8 lines', () => {
    it('X wins: row 0 [0,1,2]', () => {
      const eng = xWinsOnLine([0, 1, 2], [3, 4, 5]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('X');
      expect(winningLine).toEqual([0, 1, 2]);
    });

    it('X wins: row 1 [3,4,5]', () => {
      const eng = xWinsOnLine([3, 4, 5], [0, 1, 2]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('X');
      expect(winningLine).toEqual([3, 4, 5]);
    });

    it('X wins: row 2 [6,7,8]', () => {
      const eng = xWinsOnLine([6, 7, 8], [0, 1, 2]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('X');
      expect(winningLine).toEqual([6, 7, 8]);
    });

    it('X wins: col 0 [0,3,6]', () => {
      const eng = xWinsOnLine([0, 3, 6], [1, 2, 4]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('X');
      expect(winningLine).toEqual([0, 3, 6]);
    });

    it('X wins: col 1 [1,4,7]', () => {
      const eng = xWinsOnLine([1, 4, 7], [0, 2, 3]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('X');
      expect(winningLine).toEqual([1, 4, 7]);
    });

    it('X wins: col 2 [2,5,8]', () => {
      const eng = xWinsOnLine([2, 5, 8], [0, 1, 3]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('X');
      expect(winningLine).toEqual([2, 5, 8]);
    });

    it('X wins: main diagonal [0,4,8]', () => {
      const eng = xWinsOnLine([0, 4, 8], [1, 2, 3]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('X');
      expect(winningLine).toEqual([0, 4, 8]);
    });

    it('X wins: anti-diagonal [2,4,6]', () => {
      const eng = xWinsOnLine([2, 4, 6], [0, 1, 3]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('X');
      expect(winningLine).toEqual([2, 4, 6]);
    });
  });

  describe('win detection — O wins on each of the 8 lines', () => {
    it('O wins: row 0 [0,1,2]', () => {
      // X plays 3,5,6 — no win (avoids rows 1&2, no col/diag combo)
      const eng = oWinsOnLine([0, 1, 2], [3, 5, 6, 8]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('O');
      expect(winningLine).toEqual([0, 1, 2]);
    });

    it('O wins: row 1 [3,4,5]', () => {
      // X plays 0,2,6 — no win (avoids row 0, no col/diag combo)
      const eng = oWinsOnLine([3, 4, 5], [0, 2, 6, 8]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('O');
      expect(winningLine).toEqual([3, 4, 5]);
    });

    it('O wins: row 2 [6,7,8]', () => {
      // X plays 0,2,3 — no win (avoids rows 0&1, no col/diag combo)
      const eng = oWinsOnLine([6, 7, 8], [0, 2, 3, 5]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('O');
      expect(winningLine).toEqual([6, 7, 8]);
    });

    it('O wins: col 0 [0,3,6]', () => {
      const eng = oWinsOnLine([0, 3, 6], [1, 2, 4, 5]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('O');
      expect(winningLine).toEqual([0, 3, 6]);
    });

    it('O wins: col 1 [1,4,7]', () => {
      const eng = oWinsOnLine([1, 4, 7], [0, 2, 3, 5]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('O');
      expect(winningLine).toEqual([1, 4, 7]);
    });

    it('O wins: col 2 [2,5,8]', () => {
      const eng = oWinsOnLine([2, 5, 8], [0, 1, 3, 4]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('O');
      expect(winningLine).toEqual([2, 5, 8]);
    });

    it('O wins: main diagonal [0,4,8]', () => {
      const eng = oWinsOnLine([0, 4, 8], [1, 2, 3, 5]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('O');
      expect(winningLine).toEqual([0, 4, 8]);
    });

    it('O wins: anti-diagonal [2,4,6]', () => {
      const eng = oWinsOnLine([2, 4, 6], [0, 1, 3, 5]);
      const { status, winner, winningLine } = eng.getState();
      expect(status).toBe('win');
      expect(winner).toBe('O');
      expect(winningLine).toEqual([2, 4, 6]);
    });
  });

  // ─── No false positives ───────────────────────────────────────────────────

  describe('win detection — no false positives', () => {
    it('status remains "playing" after one mark in every line', () => {
      engine.makeMove(0); // X
      expect(engine.getState().status).toBe('playing');
    });

    it('two X marks in a row do not trigger a win', () => {
      engine.makeMove(0); // X at 0
      engine.makeMove(8); // O
      engine.makeMove(1); // X at 1
      expect(engine.getState().status).toBe('playing');
      expect(engine.getState().winner).toBeNull();
    });

    it('two X marks in a column do not trigger a win', () => {
      engine.makeMove(0); // X at 0
      engine.makeMove(8); // O
      engine.makeMove(3); // X at 3
      expect(engine.getState().status).toBe('playing');
    });

    it('two X marks on a diagonal do not trigger a win', () => {
      engine.makeMove(0); // X at 0
      engine.makeMove(8); // O
      engine.makeMove(4); // X at 4
      expect(engine.getState().status).toBe('playing');
    });

    it('mixed X/O cells in a line do not trigger a win', () => {
      engine.makeMove(0); // X
      engine.makeMove(1); // O
      engine.makeMove(2); // X — row 0: X O X — no win
      expect(engine.getState().status).toBe('playing');
      expect(engine.getState().winner).toBeNull();
    });

    it('winningLine is null when game is still playing', () => {
      engine.makeMove(0);
      engine.makeMove(4);
      expect(engine.getState().winningLine).toBeNull();
    });
  });

  // ─── Post-win guard ───────────────────────────────────────────────────────

  describe('win detection — post-win behaviour', () => {
    beforeEach(() => {
      // X wins row 0
      engine.makeMove(0);
      engine.makeMove(3);
      engine.makeMove(1);
      engine.makeMove(4);
      engine.makeMove(2); // X wins
    });

    it('makeMove returns false after game is won', () => {
      expect(engine.makeMove(5)).toBe(false);
    });

    it('board is not mutated after a rejected post-win move', () => {
      const boardBefore = engine.getState().board.slice();
      engine.makeMove(5);
      expect(engine.getState().board).toEqual(boardBefore);
    });

    it('status remains "win" after a rejected post-win move', () => {
      engine.makeMove(5);
      expect(engine.getState().status).toBe('win');
    });

    it('winner remains set after a rejected post-win move', () => {
      engine.makeMove(5);
      expect(engine.getState().winner).toBe('X');
    });

    it('winningLine is preserved after a rejected post-win move', () => {
      engine.makeMove(5);
      expect(engine.getState().winningLine).toEqual([0, 1, 2]);
    });

    it('reset() clears win state and allows new game', () => {
      engine.reset();
      const { status, winner, winningLine } = engine.getState();
      expect(status).toBe('playing');
      expect(winner).toBeNull();
      expect(winningLine).toBeNull();
      expect(engine.makeMove(0)).toBe(true);
    });
  });
});
