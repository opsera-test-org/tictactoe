import type { CellValue } from '../engine/gameEngine';

interface CellProps {
  /** The mark currently in this cell: 'X', 'O', or '' (empty). */
  value: CellValue;
  /** Index 0–8; passed back to the click handler for identification. */
  index: number;
  /** Whether this cell is part of the winning combination. */
  isWinning: boolean;
  /** When true the cell is non-interactive (game over or already occupied). */
  disabled: boolean;
  onClick: (index: number) => void;
}

export function Cell({ value, index, isWinning, disabled, onClick }: CellProps) {
  const handleClick = () => {
    if (!disabled && value === '') {
      onClick(index);
    }
  };

  const classNames = [
    'cell',
    isWinning ? 'cell--winning' : '',
    value !== '' ? 'cell--occupied' : '',
    disabled && value === '' ? 'cell--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      onClick={handleClick}
      disabled={disabled || value !== ''}
      aria-label={value ? `Cell ${index + 1}: ${value}` : `Cell ${index + 1}: empty`}
      data-testid={`cell-${index}`}
    >
      {value}
    </button>
  );
}
