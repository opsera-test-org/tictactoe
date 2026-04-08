import { describe, it, expect } from 'vitest';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { OutcomeDisplay } from './OutcomeDisplay';

function mount(jsx: Parameters<typeof render>[0]) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    render(jsx, container);
  });
  return container;
}

describe('OutcomeDisplay', () => {
  // ── Win scenarios ──────────────────────────────────────────────────

  it('shows "Player X Wins!" when X wins', () => {
    const container = mount(<OutcomeDisplay status="win" winner="X" />);
    const text = container.querySelector('.outcome-display')?.textContent ?? '';
    expect(text).toContain('Player');
    expect(text).toContain('X');
    expect(text).toContain('Wins!');
  });

  it('shows "Player O Wins!" when O wins', () => {
    const container = mount(<OutcomeDisplay status="win" winner="O" />);
    const text = container.querySelector('.outcome-display')?.textContent ?? '';
    expect(text).toContain('O');
    expect(text).toContain('Wins!');
  });

  it('does NOT show draw text when status is win', () => {
    const container = mount(<OutcomeDisplay status="win" winner="X" />);
    expect(container.querySelector('.outcome-display')?.textContent).not.toContain('Draw');
  });

  it('applies win-message class for a win', () => {
    const container = mount(<OutcomeDisplay status="win" winner="X" />);
    expect(container.querySelector('.outcome-display__message--win')).not.toBeNull();
    expect(container.querySelector('.outcome-display__message--draw')).toBeNull();
  });

  it('applies X-winner class when X wins', () => {
    const container = mount(<OutcomeDisplay status="win" winner="X" />);
    expect(container.querySelector('.outcome-display__winner--x')).not.toBeNull();
    expect(container.querySelector('.outcome-display__winner--o')).toBeNull();
  });

  it('applies O-winner class when O wins', () => {
    const container = mount(<OutcomeDisplay status="win" winner="O" />);
    expect(container.querySelector('.outcome-display__winner--o')).not.toBeNull();
    expect(container.querySelector('.outcome-display__winner--x')).toBeNull();
  });

  // ── Draw scenario ──────────────────────────────────────────────────

  it('shows "It\'s a Draw!" for a draw', () => {
    const container = mount(<OutcomeDisplay status="draw" winner={null} />);
    expect(container.querySelector('.outcome-display')?.textContent).toContain('Draw');
  });

  it('does NOT show win text for a draw', () => {
    const container = mount(<OutcomeDisplay status="draw" winner={null} />);
    const text = container.querySelector('.outcome-display')?.textContent ?? '';
    expect(text).not.toContain('Wins!');
  });

  it('applies draw-message class for a draw', () => {
    const container = mount(<OutcomeDisplay status="draw" winner={null} />);
    expect(container.querySelector('.outcome-display__message--draw')).not.toBeNull();
    expect(container.querySelector('.outcome-display__message--win')).toBeNull();
  });

  it('no winner-span is rendered for a draw', () => {
    const container = mount(<OutcomeDisplay status="draw" winner={null} />);
    expect(container.querySelector('.outcome-display__winner')).toBeNull();
  });

  // ── Accessibility ──────────────────────────────────────────────────

  it('has role="status" on the container', () => {
    const container = mount(<OutcomeDisplay status="win" winner="X" />);
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it('has aria-live="assertive" for immediate screen reader announcement', () => {
    const container = mount(<OutcomeDisplay status="win" winner="X" />);
    const el = container.querySelector('.outcome-display');
    expect(el?.getAttribute('aria-live')).toBe('assertive');
  });

  it('has aria-atomic="true" so the full message is read aloud', () => {
    const container = mount(<OutcomeDisplay status="win" winner="X" />);
    const el = container.querySelector('.outcome-display');
    expect(el?.getAttribute('aria-atomic')).toBe('true');
  });
});
