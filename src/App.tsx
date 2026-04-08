import { useRef, useState } from 'preact/hooks';
import { createGameEngine } from './engine/gameEngine';
import type { GameState } from './engine/gameEngine';
import { BoardGrid } from './components/BoardGrid';
import { TurnIndicator } from './components/TurnIndicator';
import { OutcomeDisplay } from './components/OutcomeDisplay';

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

      {/* Turn indicator — visible only during active gameplay */}
      {!isGameOver && <TurnIndicator currentPlayer={gameState.currentPlayer} />}

      {/* Outcome display — visible only when game ends */}
      {isGameOver && gameState.status !== 'playing' && (
        <OutcomeDisplay status={gameState.status} winner={gameState.winner} />
      )}

      <BoardGrid
        board={gameState.board}
        winningLine={gameState.winningLine}
        isGameOver={isGameOver}
        onCellClick={handleCellClick}
      />
    </main>
  );
}
