import { CellState, Difficulty } from '../types/game';

export const SUDOKU_TIER_CONFIG: Record<
  Difficulty,
  {
    name: string;
    badgeTitle: string;
    baseTimerSeconds: number;
    extensionSeconds: number;
    targetSpeedSeconds: number;
  }
> = {
  noob: {
    name: 'Noob',
    badgeTitle: 'Casual Brain',
    baseTimerSeconds: 6 * 60, // 6 mins
    extensionSeconds: 3 * 60, // +3 mins
    targetSpeedSeconds: 3 * 60,
  },
  grinder: {
    name: 'Grinder',
    badgeTitle: 'Locked In',
    baseTimerSeconds: 9 * 60, // 9 mins
    extensionSeconds: 4 * 60, // +4 mins
    targetSpeedSeconds: 5 * 60,
  },
  nerd: {
    name: 'Nerd',
    badgeTitle: 'Galaxy Brain',
    baseTimerSeconds: 14 * 60, // 14 mins
    extensionSeconds: 5 * 60, // +5 mins
    targetSpeedSeconds: 8 * 60,
  },
  pro: {
    name: 'Pro',
    badgeTitle: 'Sudoku Demon',
    baseTimerSeconds: 18 * 60, // 18 mins
    extensionSeconds: 6 * 60, // +6 mins
    targetSpeedSeconds: 12 * 60,
  },
  goat: {
    name: 'The GOAT',
    badgeTitle: 'The GOAT',
    baseTimerSeconds: 24 * 60, // 24 mins
    extensionSeconds: 8 * 60, // +8 mins
    targetSpeedSeconds: 16 * 60,
  },
};

export const createInitialBoard = (
  puzzleString: string,
  solutionString: string,
): CellState[] => {
  const board: CellState[] = [];
  for (let i = 0; i < 81; i++) {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    const val = parseInt(puzzleString[i], 10) || 0;
    const sol = parseInt(solutionString[i], 10) || 0;

    board.push({
      index: i,
      row,
      col,
      box,
      value: val,
      solutionValue: sol,
      isInitial: val !== 0,
      isError: false,
      notes: [],
    });
  }
  return board;
};

export const getRelatedCellIndices = (index: number): Set<number> => {
  const set = new Set<number>();
  const row = Math.floor(index / 9);
  const col = index % 9;
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    set.add(row * 9 + i); // Same row
    set.add(i * 9 + col); // Same column
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      set.add((startRow + r) * 9 + (startCol + c)); // Same 3x3 box
    }
  }

  return set;
};

export const getMatchingValueIndices = (
  board: CellState[],
  value: number,
): Set<number> => {
  const set = new Set<number>();
  if (value <= 0) return set;
  for (let i = 0; i < 81; i++) {
    if (board[i].value === value) {
      set.add(i);
    }
  }
  return set;
};

export const getRemainingNumbersCount = (
  board: CellState[],
): Record<number, number> => {
  const counts: Record<number, number> = {
    1: 9,
    2: 9,
    3: 9,
    4: 9,
    5: 9,
    6: 9,
    7: 9,
    8: 9,
    9: 9,
  };

  board.forEach((cell) => {
    if (cell.value >= 1 && cell.value <= 9 && !cell.isError) {
      counts[cell.value] = Math.max(0, counts[cell.value] - 1);
    }
  });

  return counts;
};

export const checkCompletedSections = (
  board: CellState[],
  index: number,
): { isRowComplete: boolean; isColComplete: boolean; isBoxComplete: boolean } => {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  // Check row
  let rowComplete = true;
  const rowVals = new Set<number>();
  for (let c = 0; c < 9; c++) {
    const val = board[row * 9 + c].value;
    if (val === 0 || rowVals.has(val)) {
      rowComplete = false;
      break;
    }
    rowVals.add(val);
  }

  // Check column
  let colComplete = true;
  const colVals = new Set<number>();
  for (let r = 0; r < 9; r++) {
    const val = board[r * 9 + col].value;
    if (val === 0 || colVals.has(val)) {
      colComplete = false;
      break;
    }
    colVals.add(val);
  }

  // Check 3x3 box
  let boxComplete = true;
  const boxVals = new Set<number>();
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const val = board[(startRow + r) * 9 + (startCol + c)].value;
      if (val === 0 || boxVals.has(val)) {
        boxComplete = false;
        break;
      }
      boxVals.add(val);
    }
    if (!boxComplete) break;
  }

  return {
    isRowComplete: rowComplete,
    isColComplete: colComplete,
    isBoxComplete: boxComplete,
  };
};

export const isBoardSolved = (board: CellState[]): boolean => {
  for (let i = 0; i < 81; i++) {
    if (board[i].value === 0 || board[i].value !== board[i].solutionValue) {
      return false;
    }
  }
  return true;
};

export const calculateStars = (
  timeSeconds: number,
  mistakes: number,
  difficulty: Difficulty,
): number => {
  const config = SUDOKU_TIER_CONFIG[difficulty];
  if (mistakes === 0 && timeSeconds <= config.targetSpeedSeconds) {
    return 3;
  }
  if (mistakes <= 2 && timeSeconds <= config.baseTimerSeconds) {
    return 2;
  }
  return 1;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
