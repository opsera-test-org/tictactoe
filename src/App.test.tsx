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
