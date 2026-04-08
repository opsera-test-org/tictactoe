import { describe, it, expect, vi } from 'vitest';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { Cell } from './Cell';

function renderCell(props: Partial<Parameters<typeof Cell>[0]> = {}) {
  const defaults = {
    value: '' as const,
    index: 0,
    isWinning: false,
    disabled: false,
    onClick: vi.fn(),
  };
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    render(<Cell {...defaults} {...props} />, container);
  });
  const button = container.querySelector('button')!;
  return {
    container,
    button,
    onClick: (props.onClick as ReturnType<typeof vi.fn>) ?? defaults.onClick,
  };
}

describe('Cell', () => {
  // ── Rendering ────────────────────────────────────────────────────

  it('renders a button element', () => {
    const { button } = renderCell();
    expect(button).toBeTruthy();
  });

  it('renders empty content for an empty cell', () => {
    const { button } = renderCell({ value: '' });
    expect(button.textContent).toBe('');
  });

  it('renders X for an X cell', () => {
    const { button } = renderCell({ value: 'X' });
    expect(button.textContent).toBe('X');
  });

  it('renders O for an O cell', () => {
    const { button } = renderCell({ value: 'O' });
    expect(button.textContent).toBe('O');
  });

  it('has data-testid matching the cell index', () => {
    const { button } = renderCell({ index: 4 });
    expect(button.getAttribute('data-testid')).toBe('cell-4');
  });

  // ── CSS classes ───────────────────────────────────────────────────

  it('always has the base "cell" class', () => {
    const { button } = renderCell();
    expect(button.classList.contains('cell')).toBe(true);
  });

  it('has cell--winning class when isWinning is true', () => {
    const { button } = renderCell({ isWinning: true });
    expect(button.classList.contains('cell--winning')).toBe(true);
  });

  it('does not have cell--winning class when isWinning is false', () => {
    const { button } = renderCell({ isWinning: false });
    expect(button.classList.contains('cell--winning')).toBe(false);
  });

  it('has cell--occupied class for a non-empty cell', () => {
    const { button } = renderCell({ value: 'X' });
    expect(button.classList.contains('cell--occupied')).toBe(true);
  });

  it('does not have cell--occupied class for an empty cell', () => {
    const { button } = renderCell({ value: '' });
    expect(button.classList.contains('cell--occupied')).toBe(false);
  });

  // ── Disabled state ────────────────────────────────────────────────

  it('is not disabled when empty and game is active', () => {
    const { button } = renderCell({ value: '', disabled: false });
    expect(button.disabled).toBe(false);
  });

  it('is disabled when cell is occupied', () => {
    const { button } = renderCell({ value: 'X' });
    expect(button.disabled).toBe(true);
  });

  it('is disabled when game is over (disabled prop)', () => {
    const { button } = renderCell({ value: '', disabled: true });
    expect(button.disabled).toBe(true);
  });

  // ── Click behaviour ───────────────────────────────────────────────

  it('calls onClick with the cell index on click', () => {
    const onClick = vi.fn();
    const { button } = renderCell({ index: 3, onClick });
    act(() => {
      button.click();
    });
    expect(onClick).toHaveBeenCalledWith(3);
  });

  it('does not call onClick when cell is occupied', () => {
    const onClick = vi.fn();
    const { button } = renderCell({ value: 'O', onClick });
    act(() => {
      button.click();
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when disabled is true', () => {
    const onClick = vi.fn();
    const { button } = renderCell({ value: '', disabled: true, onClick });
    act(() => {
      button.click();
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it('has aria-label "Cell 1: empty" for empty cell at index 0', () => {
    const { button } = renderCell({ value: '', index: 0 });
    expect(button.getAttribute('aria-label')).toBe('Cell 1: empty');
  });

  it('has aria-label "Cell 5: X" for X cell at index 4', () => {
    const { button } = renderCell({ value: 'X', index: 4 });
    expect(button.getAttribute('aria-label')).toBe('Cell 5: X');
  });
});
