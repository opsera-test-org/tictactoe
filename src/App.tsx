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

  function handleNewGame() {
    engineRef.current.reset();
    setGameState(engineRef.current.getState());
  }

  // No win condition — game ends only on a draw
  const isGameOver = gameState.status === 'draw';

  return (
    <main>
      <h1>Tic Tac Toe</h1>

      {/* Turn indicator — visible only during active gameplay */}
      {!isGameOver && (
        <TurnIndicator
          currentPlayer={gameState.currentPlayer}
          movesRemaining={gameState.movesRemainingThisTurn}
        />
      )}

      {/* Outcome display — only shown for a draw */}
      {isGameOver && <OutcomeDisplay status="draw" winner={null} />}

      <BoardGrid
        board={gameState.board}
        winningLine={null}
        isGameOver={isGameOver}
        onCellClick={handleCellClick}
      />

      <button type="button" className="btn-new-game" onClick={handleNewGame}>
        New Game
      </button>
    </main>
  );
}
