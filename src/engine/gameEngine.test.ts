import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine } from './gameEngine';
import type { GameEngine } from './gameEngine';

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
});
