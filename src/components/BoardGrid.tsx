import type { CellValue } from '../engine/gameEngine';
import { Cell } from './Cell';

interface BoardGridProps {
  /** 9-element array: 'X', 'O', or '' for each cell. */
  board: CellValue[];
  /** Indices of the three winning cells; null when no winner yet. */
  winningLine: number[] | null;
  /** When true all cells become non-interactive (game is over). */
  isGameOver: boolean;
  onCellClick: (index: number) => void;
}

export function BoardGrid({ board, winningLine, isGameOver, onCellClick }: BoardGridProps) {
  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          index={index}
          isWinning={winningLine?.includes(index) ?? false}
          disabled={isGameOver}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
}
