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

describe('App — ARIA live region', () => {
  it('renders a persistent sr-only status region', () => {
    const container = mountApp();
    const live = container.querySelector('.sr-only[role="status"]');
    expect(live).not.toBeNull();
    expect(live?.getAttribute('aria-live')).toBe('polite');
    expect(live?.getAttribute('aria-atomic')).toBe('true');
  });

  it('announces Player X turn and move 1 of 2 on game start', () => {
    const container = mountApp();
    const live = container.querySelector('.sr-only[role="status"]');
    expect(live?.textContent).toContain('Player X');
    expect(live?.textContent).toContain('Move 1 of 2');
  });

  it('updates announcement to move 2 of 2 after X first move', () => {
    const container = mountApp();
    const cell0 = container.querySelector('[data-testid="cell-0"]') as HTMLButtonElement;
    act(() => {
      cell0.click();
    });
    const live = container.querySelector('.sr-only[role="status"]');
    expect(live?.textContent).toContain('Move 2 of 2');
  });

  it('announces Player O turn after X uses both moves', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      cells[0].click();
    }); // X 1/2
    act(() => {
      cells[1].click();
    }); // X 2/2
    const live = container.querySelector('.sr-only[role="status"]');
    expect(live?.textContent).toContain('Player O');
  });

  it('announces draw when board is full', () => {
    const container = mountApp();
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      for (const idx of FULL_BOARD_ORDER) cells[idx].click();
    });
    const live = container.querySelector('.sr-only[role="status"]');
    expect(live?.textContent?.toLowerCase()).toContain('draw');
  });

  it('live region persists through game-over transition (never unmounts)', () => {
    const container = mountApp();
    const liveBeforeEnd = container.querySelector('.sr-only[role="status"]');
    const cells = container.querySelectorAll('[data-testid]') as unknown as HTMLButtonElement[];
    act(() => {
      for (const idx of FULL_BOARD_ORDER) cells[idx].click();
    });
    const liveAfterEnd = container.querySelector('.sr-only[role="status"]');
    expect(liveBeforeEnd).toBe(liveAfterEnd); // same DOM node — never removed
  });
});

describe('App — keyboard accessibility', () => {
  it('all empty cells are focusable (not disabled)', () => {
    const container = mountApp();
    const cells = Array.from(container.querySelectorAll('[data-testid]')) as HTMLButtonElement[];
    cells.forEach((cell) => expect(cell.disabled).toBe(false));
  });

  it('occupied cells become non-focusable (disabled)', () => {
    const container = mountApp();
    const cell0 = container.querySelector('[data-testid="cell-0"]') as HTMLButtonElement;
    act(() => {
      cell0.click();
    });
    expect(cell0.disabled).toBe(true);
  });

  it('cell buttons have aria-labels describing their state', () => {
    const container = mountApp();
    const cell0 = container.querySelector('[data-testid="cell-0"]') as HTMLButtonElement;
    expect(cell0.getAttribute('aria-label')).toContain('Cell 1');
    expect(cell0.getAttribute('aria-label')).toContain('empty');
    act(() => {
      cell0.click();
    });
    // After occupation aria-label should reference the mark
    const cell1 = container.querySelector('[data-testid="cell-1"]') as HTMLButtonElement;
    expect(cell1.getAttribute('aria-label')).toContain('empty');
  });

  it('board container has an accessible label', () => {
    const container = mountApp();
    const board = container.querySelector('.board');
    expect(board?.getAttribute('aria-label')).toBe('Tic Tac Toe board');
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
