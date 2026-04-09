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

// Fill all 9 cells sequentially to trigger a draw
const FULL_BOARD_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8];

describe('App', () => {
  it('renders the Tic Tac Toe heading', () => {
    const container = mountApp();
    expect(container.querySelector('h1')?.textContent).toBe('Tic Tac Toe');
  });

  it('renders a 3x3 board with 9 cells', () => {
    const container = mountApp();
    // 9 cell buttons + 1 New Game button
    expect(container.querySelectorAll('[data-testid]')).toHaveLength(9);
  });

  it('renders the New Game button', () => {
    const container = mountApp();
    expect(container.querySelector('.btn-new-game')).not.toBeNull();
    expect(container.querySelector('.btn-new-game')?.textContent).toBe('New Game');
  });

  it('places X (square mark) on the first cell click', () => {
    const container = mountApp();
    const cell0 = container.querySelector('[data-testid="cell-0"]') as HTMLButtonElement;
    act(() => {
      cell0.click();
    });
    expect(cell0.querySelector('.mark--x')).not.toBeNull();
  });

  it('places X again on the second click (X gets 2 moves)', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      cells[0].click();
    }); // X move 1/2
    act(() => {
      cells[1].click();
    }); // X move 2/2
    expect(cells[1].querySelector('.mark--x')).not.toBeNull();
  });

  it('places O (triangle mark) on the third click (O first move)', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      cells[0].click();
    }); // X 1/2
    act(() => {
      cells[1].click();
    }); // X 2/2
    act(() => {
      cells[2].click();
    }); // O 1/2
    expect(cells[2].querySelector('.mark--o')).not.toBeNull();
  });

  it('ignores clicks on already-occupied cells', () => {
    const container = mountApp();
    const cell = container.querySelector('[data-testid="cell-0"]') as HTMLButtonElement;
    act(() => {
      cell.click(); // X move 1
      cell.click(); // rejected — occupied
    });
    expect(cell.querySelector('.mark--x')).not.toBeNull();
    expect(cell.querySelectorAll('.mark')).toHaveLength(1);
  });
});

describe('App — TurnIndicator integration', () => {
  it('shows "Move 1 of 2" for Player X on game start', () => {
    const container = mountApp();
    const indicator = container.querySelector('.turn-indicator');
    expect(indicator).not.toBeNull();
    expect(indicator?.querySelector('.turn-indicator__player')?.textContent).toContain('X');
    expect(indicator?.querySelector('.turn-indicator__moves')?.textContent).toContain('1 of 2');
  });

  it('shows "Move 2 of 2" for Player X after their first move', () => {
    const container = mountApp();
    const cell0 = container.querySelector('[data-testid="cell-0"]') as HTMLButtonElement;
    act(() => {
      cell0.click();
    }); // X move 1/2
    const moves = container.querySelector('.turn-indicator__moves');
    expect(moves?.textContent).toContain('2 of 2');
    expect(container.querySelector('.turn-indicator__mark--x')).not.toBeNull();
  });

  it('switches to Player O "Move 1 of 2" after X uses both moves', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      cells[0].click();
    }); // X 1/2
    act(() => {
      cells[1].click();
    }); // X 2/2 → O
    expect(container.querySelector('.turn-indicator__mark--o')).not.toBeNull();
    expect(container.querySelector('.turn-indicator__moves')?.textContent).toContain('1 of 2');
  });

  it('hides turn indicator when board is full (draw)', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      for (const idx of FULL_BOARD_ORDER) cells[idx].click();
    });
    expect(container.querySelector('.turn-indicator')).toBeNull();
    expect(container.querySelector('.outcome-display')).not.toBeNull();
  });
});

describe('App — New Game button', () => {
  it('New Game button is visible during active gameplay', () => {
    const container = mountApp();
    expect(container.querySelector('.btn-new-game')).not.toBeNull();
  });

  it('New Game button is visible after game ends in a draw', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      for (const idx of FULL_BOARD_ORDER) cells[idx].click();
    });
    expect(container.querySelector('.outcome-display')).not.toBeNull();
    expect(container.querySelector('.btn-new-game')).not.toBeNull();
  });

  it('clicking New Game clears all marks from the board', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      cells[0].click();
    }); // place a mark
    act(() => {
      cells[1].click();
    });
    const newGameBtn = container.querySelector('.btn-new-game') as HTMLButtonElement;
    act(() => {
      newGameBtn.click();
    });
    expect(container.querySelectorAll('.mark')).toHaveLength(0);
  });

  it('clicking New Game hides the outcome display', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      for (const idx of FULL_BOARD_ORDER) cells[idx].click();
    });
    expect(container.querySelector('.outcome-display')).not.toBeNull();
    const newGameBtn = container.querySelector('.btn-new-game') as HTMLButtonElement;
    act(() => {
      newGameBtn.click();
    });
    expect(container.querySelector('.outcome-display')).toBeNull();
  });

  it('clicking New Game restores Player X turn indicator', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      for (const idx of FULL_BOARD_ORDER) cells[idx].click();
    });
    const newGameBtn = container.querySelector('.btn-new-game') as HTMLButtonElement;
    act(() => {
      newGameBtn.click();
    });
    const indicator = container.querySelector('.turn-indicator');
    expect(indicator).not.toBeNull();
    expect(indicator?.querySelector('.turn-indicator__mark--x')).not.toBeNull();
    expect(indicator?.querySelector('.turn-indicator__moves')?.textContent).toContain('1 of 2');
  });

  it('clicking New Game mid-game resets correctly', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      cells[0].click();
    }); // X 1/2
    act(() => {
      cells[1].click();
    }); // X 2/2 → O's turn
    const newGameBtn = container.querySelector('.btn-new-game') as HTMLButtonElement;
    act(() => {
      newGameBtn.click();
    });
    // Board is empty and back to X's first move
    expect(container.querySelectorAll('.mark')).toHaveLength(0);
    expect(container.querySelector('.turn-indicator__mark--x')).not.toBeNull();
    expect(container.querySelector('.turn-indicator__moves')?.textContent).toContain('1 of 2');
  });

  it('can play a full game again after New Game', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      for (const idx of FULL_BOARD_ORDER) cells[idx].click();
    });
    const newGameBtn = container.querySelector('.btn-new-game') as HTMLButtonElement;
    act(() => {
      newGameBtn.click();
    });
    // Play two more moves on the fresh board
    act(() => {
      cells[0].click();
    });
    expect(cells[0].querySelector('.mark--x')).not.toBeNull();
  });
});

describe('App — no-win rule: cells are never highlighted', () => {
  it('outcome display is absent during active gameplay', () => {
    const container = mountApp();
    expect(container.querySelector('.outcome-display')).toBeNull();
  });

  it('no cells have cell--winning class at any point', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    // Play several moves including what would be a win pattern in classic tic tac toe
    act(() => {
      cells[0].click();
    }); // X 1/2
    act(() => {
      cells[1].click();
    }); // X 2/2
    act(() => {
      cells[2].click();
    }); // O 1/2 — top row now X,X,O
    expect(container.querySelectorAll('.cell--winning')).toHaveLength(0);
  });

  it('draw outcome shows when board is fully filled', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      for (const idx of FULL_BOARD_ORDER) cells[idx].click();
    });
    const outcome = container.querySelector('.outcome-display');
    expect(outcome?.textContent).toContain('Draw');
    expect(container.querySelectorAll('.cell--winning')).toHaveLength(0);
  });
});
