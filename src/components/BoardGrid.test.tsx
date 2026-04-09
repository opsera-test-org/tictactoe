import { describe, it, expect, vi } from 'vitest';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { BoardGrid } from './BoardGrid';
import type { CellValue } from '../engine/gameEngine';

const EMPTY_BOARD: CellValue[] = Array(9).fill('');

function renderBoard(props: Partial<Parameters<typeof BoardGrid>[0]> = {}) {
  const defaults = {
    board: EMPTY_BOARD,
    winningLine: null,
    isGameOver: false,
    onCellClick: vi.fn(),
  };
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    render(<BoardGrid {...defaults} {...props} />, container);
  });
  const boardEl = container.querySelector('.board')!;
  const cells = container.querySelectorAll('button');
  return {
    container,
    boardEl,
    cells,
    onCellClick: (props.onCellClick as ReturnType<typeof vi.fn>) ?? defaults.onCellClick,
  };
}

describe('BoardGrid', () => {
  // ── Structure ─────────────────────────────────────────────────────

  it('renders the board container with role="group"', () => {
    const { boardEl } = renderBoard();
    expect(boardEl).toBeTruthy();
    expect(boardEl.getAttribute('role')).toBe('group');
  });

  it('renders exactly 9 cell buttons', () => {
    const { cells } = renderBoard();
    expect(cells).toHaveLength(9);
  });

  it('all cells are empty on an empty board', () => {
    const { cells } = renderBoard();
    cells.forEach((cell) => expect(cell.textContent).toBe(''));
  });

  // ── Board state rendering ─────────────────────────────────────────

  it('renders X and O shape marks from the board array', () => {
    const board: CellValue[] = ['X', 'O', '', '', '', '', '', '', ''];
    const { cells } = renderBoard({ board });
    expect(cells[0].querySelector('.mark--x')).not.toBeNull();
    expect(cells[1].querySelector('.mark--o')).not.toBeNull();
    expect(cells[2].querySelector('.mark')).toBeNull();
  });

  it('each cell has the correct data-testid', () => {
    const { cells } = renderBoard();
    cells.forEach((cell, i) => {
      expect(cell.getAttribute('data-testid')).toBe(`cell-${i}`);
    });
  });

  // ── Click handling ────────────────────────────────────────────────

  it('calls onCellClick with the correct index when an empty cell is clicked', () => {
    const onCellClick = vi.fn();
    const { cells } = renderBoard({ onCellClick });
    act(() => {
      cells[4].click();
    });
    expect(onCellClick).toHaveBeenCalledWith(4);
  });

  it('calls onCellClick for each distinct cell index', () => {
    const onCellClick = vi.fn();
    const { cells } = renderBoard({ onCellClick });
    act(() => {
      cells[0].click();
      cells[8].click();
    });
    expect(onCellClick).toHaveBeenCalledTimes(2);
    expect(onCellClick).toHaveBeenNthCalledWith(1, 0);
    expect(onCellClick).toHaveBeenNthCalledWith(2, 8);
  });

  // ── Occupied cells ────────────────────────────────────────────────

  it('occupied cells are disabled', () => {
    const board: CellValue[] = ['X', '', '', '', '', '', '', '', ''];
    const { cells } = renderBoard({ board });
    expect(cells[0].disabled).toBe(true);
    expect(cells[1].disabled).toBe(false);
  });

  it('occupied cells do not call onCellClick when clicked', () => {
    const onCellClick = vi.fn();
    const board: CellValue[] = ['O', '', '', '', '', '', '', '', ''];
    const { cells } = renderBoard({ board, onCellClick });
    act(() => {
      cells[0].click();
    });
    expect(onCellClick).not.toHaveBeenCalled();
  });

  // ── Winning line highlight ────────────────────────────────────────

  it('winning cells have cell--winning class', () => {
    const board: CellValue[] = ['X', 'X', 'X', '', '', '', '', '', ''];
    const { cells } = renderBoard({ board, winningLine: [0, 1, 2] });
    expect(cells[0].classList.contains('cell--winning')).toBe(true);
    expect(cells[1].classList.contains('cell--winning')).toBe(true);
    expect(cells[2].classList.contains('cell--winning')).toBe(true);
  });

  it('non-winning cells do not have cell--winning class', () => {
    const board: CellValue[] = ['X', 'X', 'X', '', '', '', '', '', ''];
    const { cells } = renderBoard({ board, winningLine: [0, 1, 2] });
    [3, 4, 5, 6, 7, 8].forEach((i) => {
      expect(cells[i].classList.contains('cell--winning')).toBe(false);
    });
  });

  it('no cells have cell--winning when winningLine is null', () => {
    const { cells } = renderBoard({ winningLine: null });
    cells.forEach((cell) => {
      expect(cell.classList.contains('cell--winning')).toBe(false);
    });
  });

  // ── Game-over state ───────────────────────────────────────────────

  it('all cells are disabled when isGameOver is true', () => {
    const { cells } = renderBoard({ isGameOver: true });
    cells.forEach((cell) => {
      expect(cell.disabled).toBe(true);
    });
  });

  it('no clicks are dispatched when isGameOver is true', () => {
    const onCellClick = vi.fn();
    const { cells } = renderBoard({ isGameOver: true, onCellClick });
    act(() => {
      cells.forEach((cell) => cell.click());
    });
    expect(onCellClick).not.toHaveBeenCalled();
  });

  // ── Re-render ─────────────────────────────────────────────────────

  it('updates displayed marks when board prop changes', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const onCellClick = vi.fn();

    act(() => {
      render(
        <BoardGrid
          board={EMPTY_BOARD}
          winningLine={null}
          isGameOver={false}
          onCellClick={onCellClick}
        />,
        container,
      );
    });
    expect(container.querySelectorAll('button')[0].textContent).toBe('');

    const updatedBoard: CellValue[] = ['X', '', '', '', '', '', '', '', ''];
    act(() => {
      render(
        <BoardGrid
          board={updatedBoard}
          winningLine={null}
          isGameOver={false}
          onCellClick={onCellClick}
        />,
        container,
      );
    });
    expect(container.querySelectorAll('button')[0].querySelector('.mark--x')).not.toBeNull();
  });
});
