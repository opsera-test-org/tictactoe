import { describe, it, expect } from 'vitest';
import { render } from 'preact';
import { App } from './App';

describe('App placeholder', () => {
  it('renders the Tic Tac Toe heading', () => {
    const container = document.createElement('div');
    render(<App />, container);
    expect(container.querySelector('h1')?.textContent).toBe('Tic Tac Toe');
  });
});
