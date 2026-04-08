import type { Player } from '../engine/gameEngine';

interface TurnIndicatorProps {
  currentPlayer: Player;
  /** How many moves the current player still has this turn (1 or 2). */
  movesRemaining: number;
}

/**
 * Displays whose turn it is and how many moves they have left.
 * Hidden when the game ends — replaced by OutcomeDisplay.
 */
export function TurnIndicator({ currentPlayer, movesRemaining }: TurnIndicatorProps) {
  return (
    <div className="turn-indicator" aria-live="polite" aria-atomic="true">
      <p className="turn-indicator__player">
        Player{' '}
        <span
          className={`turn-indicator__mark turn-indicator__mark--${currentPlayer.toLowerCase()}`}
        >
          {currentPlayer}
        </span>
        's Turn
      </p>
      <p className="turn-indicator__moves">
        {movesRemaining === 2 ? 'Move 1 of 2' : 'Move 2 of 2'}
      </p>
    </div>
  );
}
