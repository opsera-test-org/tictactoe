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
  it("shows Player X's turn text when currentPlayer is X", () => {
    const container = mount(<TurnIndicator currentPlayer="X" />);
    expect(container.querySelector('.turn-indicator')?.textContent).toContain('X');
    expect(container.querySelector('.turn-indicator')?.textContent).toContain('Turn');
  });

  it("shows Player O's turn text when currentPlayer is O", () => {
    const container = mount(<TurnIndicator currentPlayer="O" />);
    const text = container.querySelector('.turn-indicator')?.textContent ?? '';
    expect(text).toContain('O');
    expect(text).toContain('Turn');
  });

  it('applies the turn-indicator class to the container element', () => {
    const container = mount(<TurnIndicator currentPlayer="X" />);
    expect(container.querySelector('.turn-indicator')).not.toBeNull();
  });

  it('applies X-specific mark class when player is X', () => {
    const container = mount(<TurnIndicator currentPlayer="X" />);
    expect(container.querySelector('.turn-indicator__mark--x')).not.toBeNull();
    expect(container.querySelector('.turn-indicator__mark--o')).toBeNull();
  });

  it('applies O-specific mark class when player is O', () => {
    const container = mount(<TurnIndicator currentPlayer="O" />);
    expect(container.querySelector('.turn-indicator__mark--o')).not.toBeNull();
    expect(container.querySelector('.turn-indicator__mark--x')).toBeNull();
  });

  it('has aria-live="polite" for accessible announcements', () => {
    const container = mount(<TurnIndicator currentPlayer="X" />);
    const el = container.querySelector('.turn-indicator');
    expect(el?.getAttribute('aria-live')).toBe('polite');
  });

  it('has aria-atomic="true" so the full label is re-announced on change', () => {
    const container = mount(<TurnIndicator currentPlayer="X" />);
    const el = container.querySelector('.turn-indicator');
    expect(el?.getAttribute('aria-atomic')).toBe('true');
  });

  it('updates correctly when re-rendered with a different player', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => {
      render(<TurnIndicator currentPlayer="X" />, container);
    });
    expect(container.querySelector('.turn-indicator__mark--x')).not.toBeNull();

    act(() => {
      render(<TurnIndicator currentPlayer="O" />, container);
    });
    expect(container.querySelector('.turn-indicator__mark--o')).not.toBeNull();
    expect(container.querySelector('.turn-indicator__mark--x')).toBeNull();
  });
});
