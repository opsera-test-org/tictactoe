import type { Player } from '../engine/gameEngine';

interface OutcomeDisplayProps {
  status: 'win' | 'draw';
  winner: Player | null;
}

/**
 * Shown when the game ends. Renders win/draw message prominently.
 * Winning-cell highlight is handled by BoardGrid / Cell (winningLine prop).
 */
export function OutcomeDisplay({ status, winner }: OutcomeDisplayProps) {
  const isWin = status === 'win' && winner !== null;

  return (
    <div className="outcome-display" role="status" aria-live="assertive" aria-atomic="true">
      {isWin ? (
        <p className="outcome-display__message outcome-display__message--win">
          Player{' '}
          <span
            className={`outcome-display__winner outcome-display__winner--${winner.toLowerCase()}`}
          >
            {winner}
          </span>{' '}
          Wins!
        </p>
      ) : (
        <p className="outcome-display__message outcome-display__message--draw">It&apos;s a Draw!</p>
      )}
    </div>
  );
}
