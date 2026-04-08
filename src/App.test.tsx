import { describe, it, expect } from 'vitest';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { App } from './App';

function mountApp() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    render(<App />, container);
  });
  return container;
}

describe('App', () => {
  it('renders the Tic Tac Toe heading', () => {
    const container = mountApp();
    expect(container.querySelector('h1')?.textContent).toBe('Tic Tac Toe');
  });

  it('renders a 3x3 board with 9 cells', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('button');
    expect(cells).toHaveLength(9);
  });

  it('places X on the first cell click', () => {
    const container = mountApp();
    const cell0 = container.querySelector('[data-testid="cell-0"]') as HTMLButtonElement;
    act(() => {
      cell0.click();
    });
    expect(cell0.textContent).toBe('X');
  });

  it('places O on the second cell click', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      cells[0].click(); // X
    });
    act(() => {
      cells[1].click(); // O
    });
    expect(cells[1].textContent).toBe('O');
  });

  it('ignores clicks on already-occupied cells', () => {
    const container = mountApp();
    const cell = container.querySelector('[data-testid="cell-0"]') as HTMLButtonElement;
    act(() => {
      cell.click(); // X
      cell.click(); // should be ignored
    });
    expect(cell.textContent).toBe('X');
  });
});

describe('App — TurnIndicator integration', () => {
  it("shows Player X's turn indicator on game start", () => {
    const container = mountApp();
    const indicator = container.querySelector('.turn-indicator');
    expect(indicator).not.toBeNull();
    expect(indicator?.textContent).toContain('X');
  });

  it("toggles to Player O's turn after X moves", () => {
    const container = mountApp();
    const cell0 = container.querySelector('[data-testid="cell-0"]') as HTMLButtonElement;
    act(() => {
      cell0.click();
    });
    const indicator = container.querySelector('.turn-indicator');
    expect(indicator?.textContent).toContain('O');
  });

  it('hides turn indicator and shows outcome message when game ends in a win', () => {
    const container = mountApp();
    // X wins via top row: 0, 1, 2 — O plays 3, 4
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      cells[0].click();
    }); // X
    act(() => {
      cells[3].click();
    }); // O
    act(() => {
      cells[1].click();
    }); // X
    act(() => {
      cells[4].click();
    }); // O
    act(() => {
      cells[2].click();
    }); // X wins

    expect(container.querySelector('.turn-indicator')).toBeNull();
    const outcome = container.querySelector('.outcome-placeholder');
    expect(outcome?.textContent).toContain('Player X Wins!');
  });

  it('hides turn indicator and shows draw outcome when game ends in a draw', () => {
    const container = mountApp();
    // Force a draw: X O X / O X X / O X O
    const order = [0, 1, 2, 4, 3, 6, 5, 8, 7];
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      for (const idx of order) {
        cells[idx].click();
      }
    });

    expect(container.querySelector('.turn-indicator')).toBeNull();
    const outcome = container.querySelector('.outcome-placeholder');
    expect(outcome?.textContent).toContain('Draw');
  });
});
