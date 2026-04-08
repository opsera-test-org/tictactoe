import { useRef, useState } from 'preact/hooks';
import { createGameEngine } from './engine/gameEngine';
import type { GameState } from './engine/gameEngine';
import { BoardGrid } from './components/BoardGrid';

export function App() {
  const engineRef = useRef(createGameEngine());
  const [gameState, setGameState] = useState<GameState>(() => engineRef.current.getState());

  function handleCellClick(index: number) {
    const moved = engineRef.current.makeMove(index);
    if (moved) {
      setGameState(engineRef.current.getState());
    }
  }

  const isGameOver = gameState.status !== 'playing';

  return (
    <main>
      <h1>Tic Tac Toe</h1>
      <BoardGrid
        board={gameState.board}
        winningLine={gameState.winningLine}
        isGameOver={isGameOver}
        onCellClick={handleCellClick}
      />
    </main>
  );
}
