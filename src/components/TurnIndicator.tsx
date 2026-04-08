import type { Player } from '../engine/gameEngine';

interface TurnIndicatorProps {
  currentPlayer: Player;
}

/**
 * Displays whose turn it is during active gameplay.
 * Hidden when the game ends — replaced by OutcomeDisplay (WO-009).
 */
export function TurnIndicator({ currentPlayer }: TurnIndicatorProps) {
  return (
    <p className="turn-indicator" aria-live="polite" aria-atomic="true">
      Player{' '}
      <span className={`turn-indicator__mark turn-indicator__mark--${currentPlayer.toLowerCase()}`}>
        {currentPlayer}
      </span>
      's Turn
    </p>
  );
}
