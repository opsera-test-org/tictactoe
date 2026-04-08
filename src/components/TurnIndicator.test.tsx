import { describe, it, expect } from 'vitest';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { TurnIndicator } from './TurnIndicator';

function mount(jsx: Parameters<typeof render>[0]) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    render(jsx, container);
  });
  return container;
}

describe('TurnIndicator', () => {
  // ── Player text ───────────────────────────────────────────────────

  it("shows Player X's turn text when currentPlayer is X", () => {
    const container = mount(<TurnIndicator currentPlayer="X" movesRemaining={2} />);
    expect(container.querySelector('.turn-indicator__player')?.textContent).toContain('X');
    expect(container.querySelector('.turn-indicator__player')?.textContent).toContain('Turn');
  });

  it("shows Player O's turn text when currentPlayer is O", () => {
    const container = mount(<TurnIndicator currentPlayer="O" movesRemaining={2} />);
    const text = container.querySelector('.turn-indicator__player')?.textContent ?? '';
    expect(text).toContain('O');
    expect(text).toContain('Turn');
  });

  // ── Move count display ────────────────────────────────────────────

  it('shows "Move 1 of 2" when movesRemaining is 2', () => {
    const container = mount(<TurnIndicator currentPlayer="X" movesRemaining={2} />);
    expect(container.querySelector('.turn-indicator__moves')?.textContent).toContain('1 of 2');
  });

  it('shows "Move 2 of 2" when movesRemaining is 1', () => {
    const container = mount(<TurnIndicator currentPlayer="X" movesRemaining={1} />);
    expect(container.querySelector('.turn-indicator__moves')?.textContent).toContain('2 of 2');
  });

  // ── CSS classes ───────────────────────────────────────────────────

  it('applies the turn-indicator class to the container element', () => {
    const container = mount(<TurnIndicator currentPlayer="X" movesRemaining={2} />);
    expect(container.querySelector('.turn-indicator')).not.toBeNull();
  });

  it('applies X-specific mark class when player is X', () => {
    const container = mount(<TurnIndicator currentPlayer="X" movesRemaining={2} />);
    expect(container.querySelector('.turn-indicator__mark--x')).not.toBeNull();
    expect(container.querySelector('.turn-indicator__mark--o')).toBeNull();
  });

  it('applies O-specific mark class when player is O', () => {
    const container = mount(<TurnIndicator currentPlayer="O" movesRemaining={2} />);
    expect(container.querySelector('.turn-indicator__mark--o')).not.toBeNull();
    expect(container.querySelector('.turn-indicator__mark--x')).toBeNull();
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it('has aria-live="polite" for accessible announcements', () => {
    const container = mount(<TurnIndicator currentPlayer="X" movesRemaining={2} />);
    const el = container.querySelector('.turn-indicator');
    expect(el?.getAttribute('aria-live')).toBe('polite');
  });

  it('has aria-atomic="true" so the full label is re-announced on change', () => {
    const container = mount(<TurnIndicator currentPlayer="X" movesRemaining={2} />);
    const el = container.querySelector('.turn-indicator');
    expect(el?.getAttribute('aria-atomic')).toBe('true');
  });

  // ── Re-render ─────────────────────────────────────────────────────

  it('updates player and move count correctly when re-rendered', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      render(<TurnIndicator currentPlayer="X" movesRemaining={2} />, container);
    });
    expect(container.querySelector('.turn-indicator__mark--x')).not.toBeNull();
    expect(container.querySelector('.turn-indicator__moves')?.textContent).toContain('1 of 2');

    act(() => {
      render(<TurnIndicator currentPlayer="X" movesRemaining={1} />, container);
    });
    expect(container.querySelector('.turn-indicator__moves')?.textContent).toContain('2 of 2');

    act(() => {
      render(<TurnIndicator currentPlayer="O" movesRemaining={2} />, container);
    });
    expect(container.querySelector('.turn-indicator__mark--o')).not.toBeNull();
    expect(container.querySelector('.turn-indicator__moves')?.textContent).toContain('1 of 2');
  });
});
