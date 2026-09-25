import { create } from 'zustand';
import { CellState, Difficulty, MoveHistory, PuzzleData } from '../types/game';
import {
  checkCompletedSections,
  createInitialBoard,
  formatTime,
  getMatchingValueIndices,
  getRelatedCellIndices,
  getRemainingNumbersCount,
  isBoardSolved,
  SUDOKU_TIER_CONFIG,
  calculateStars,
} from '../engine/sudokuLogic';
import { praiseEngine, PraiseMessage } from '../engine/praiseEngine';
import { hapticService } from '../services/hapticService';
import { useCampaignStore } from './useCampaignStore';
import { useProfileStore } from './useProfileStore';
import { AdService } from '../services/adService';

export type GameStatus =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'overtime_prompt'
  | 'victory'
  | 'game_over';

interface GameState {
  currentPuzzle: PuzzleData | null;
  difficulty: Difficulty;
  isCampaign: boolean;
  stageNumber: number | null;
  isBonusStage: boolean;

  board: CellState[];
  selectedCellIndex: number | null;
  isNotesMode: boolean;
  mistakes: number;
  maxMistakesAllowed: number; // 3 or Infinity (Chill Mode)

  timeRemainingSeconds: number;
  timeElapsedSeconds: number;
  overtimeCount: number; // how many times ad extra time was used
  status: GameStatus;

  history: MoveHistory[];
  praiseToast: PraiseMessage | null;

  // Cached selector-like sets for fast rendering
  relatedIndices: Set<number>;
  sameNumberIndices: Set<number>;
  remainingCounts: Record<number, number>;

  // Actions
  startNewGame: (puzzle: PuzzleData, isCampaign?: boolean) => void;
  selectCell: (index: number) => void;
  inputNumber: (num: number) => void;
  toggleNoteMode: () => void;
  eraseCell: () => void;
  undo: () => void;
  useSmartHint: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  tickTimer: () => void;
  requestExtraTimeWithAd: () => Promise<boolean>;
  restartGame: () => void;
  dismissPraiseToast: () => void;
  toggleChillMode: () => void;
}

let timerInterval: any = null;

export const useGameStore = create<GameState>((set, get) => {
  const clearTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    timerInterval = setInterval(() => {
      get().tickTimer();
    }, 1000);
  };

  return {
    currentPuzzle: null,
    difficulty: 'noob',
    isCampaign: true,
    stageNumber: 1,
    isBonusStage: false,

    board: [],
    selectedCellIndex: null,
    isNotesMode: false,
    mistakes: 0,
    maxMistakesAllowed: 3,

    timeRemainingSeconds: 360,
    timeElapsedSeconds: 0,
    overtimeCount: 0,
    status: 'idle',

    history: [],
    praiseToast: null,

    relatedIndices: new Set(),
    sameNumberIndices: new Set(),
    remainingCounts: { 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 9, 7: 9, 8: 9, 9: 9 },

    startNewGame: (puzzle: PuzzleData, isCampaign = true) => {
      clearTimer();
      const board = createInitialBoard(puzzle.puzzle, puzzle.solution);
      const tierConfig = SUDOKU_TIER_CONFIG[puzzle.difficulty];
      const remainingCounts = getRemainingNumbersCount(board);

      set({
        currentPuzzle: puzzle,
        difficulty: puzzle.difficulty,
        isCampaign,
        stageNumber: puzzle.stageNumber,
        isBonusStage: !!puzzle.isBonusStage,
        board,
        selectedCellIndex: null,
        isNotesMode: false,
        mistakes: 0,
        timeRemainingSeconds: tierConfig.baseTimerSeconds,
        timeElapsedSeconds: 0,
        overtimeCount: 0,
        status: 'playing',
        history: [],
        praiseToast: null,
        relatedIndices: new Set(),
        sameNumberIndices: new Set(),
        remainingCounts,
      });

      startTimer();
    },

    selectCell: (index: number) => {
      const { board, selectedCellIndex } = get();
      if (selectedCellIndex === index) return;

      const cell = board[index];
      const relatedIndices = getRelatedCellIndices(index);
      const sameNumberIndices =
        cell.value > 0 ? getMatchingValueIndices(board, cell.value) : new Set<number>();

      hapticService.cellSelect();

      set({
        selectedCellIndex: index,
        relatedIndices,
        sameNumberIndices,
      });
    },

    toggleNoteMode: () => {
      hapticService.tap();
      set((state) => ({ isNotesMode: !state.isNotesMode }));
    },

    toggleChillMode: () => {
      set((state) => ({
        maxMistakesAllowed: state.maxMistakesAllowed === 3 ? Infinity : 3,
      }));
    },

    inputNumber: (num: number) => {
      const state = get();
      const { selectedCellIndex, board, isNotesMode, history, mistakes, maxMistakesAllowed } =
        state;

      if (selectedCellIndex === null || state.status !== 'playing') return;

      const cell = board[selectedCellIndex];
      if (cell.isInitial) return; // Cannot modify fixed puzzle clues

      const newBoard = board.map((c) => ({ ...c, notes: [...c.notes] }));
      const targetCell = newBoard[selectedCellIndex];

      if (isNotesMode) {
        // Toggle pencil mark
        hapticService.numberInput();
        const noteIdx = targetCell.notes.indexOf(num);
        const prevNotes = [...targetCell.notes];
        if (noteIdx > -1) {
          targetCell.notes.splice(noteIdx, 1);
        } else {
          targetCell.notes.push(num);
          targetCell.notes.sort();
        }

        set({
          board: newBoard,
          history: [
            ...history,
            {
              index: selectedCellIndex,
              prevValue: targetCell.value,
              newValue: targetCell.value,
              prevNotes,
              newNotes: targetCell.notes,
            },
          ],
        });
        return;
      }

      // Normal value input
      const prevVal = targetCell.value;
      const prevNotes = [...targetCell.notes];
      const isCorrect = num === targetCell.solutionValue;

      targetCell.value = num;
      targetCell.notes = []; // Clear notes on value placement
      targetCell.isError = !isCorrect;

      const newHistory = [
        ...history,
        {
          index: selectedCellIndex,
          prevValue: prevVal,
          newValue: num,
          prevNotes,
          newNotes: [],
        },
      ];

      if (!isCorrect) {
        hapticService.error();
        const newMistakes = mistakes + 1;
        const isGameOver = newMistakes >= maxMistakesAllowed;

        if (isGameOver) {
          clearTimer();
          set({
            board: newBoard,
            mistakes: newMistakes,
            status: 'game_over',
            history: newHistory,
          });
          return;
        }

        set({
          board: newBoard,
          mistakes: newMistakes,
          history: newHistory,
          sameNumberIndices: getMatchingValueIndices(newBoard, num),
        });
        return;
      }

      // Correct placement
      hapticService.numberInput();

      // Auto-erase this number from related cells' pencil notes
      const related = getRelatedCellIndices(selectedCellIndex);
      related.forEach((idx) => {
        const nIdx = newBoard[idx].notes.indexOf(num);
        if (nIdx > -1) {
          newBoard[idx].notes.splice(nIdx, 1);
        }
      });

      // Check section completion for positive reinforcement
      const completion = checkCompletedSections(newBoard, selectedCellIndex);
      let praise = state.praiseToast;
      if (completion.isRowComplete || completion.isColComplete || completion.isBoxComplete) {
        hapticService.sectionClear();
        praise = praiseEngine.getSectionClearPraise();
      }

      const remainingCounts = getRemainingNumbersCount(newBoard);
      const isSolved = isBoardSolved(newBoard);

      if (isSolved) {
        clearTimer();
        hapticService.victory();
        const stars = calculateStars(state.timeElapsedSeconds, state.mistakes, state.difficulty);

        // Record victory in stores
        useProfileStore.getState().recordGameFinished(
          state.difficulty,
          true,
          state.timeElapsedSeconds,
          state.mistakes,
        );

        if (state.isCampaign && state.stageNumber) {
          useCampaignStore
            .getState()
            .recordStageComplete(
              state.difficulty,
              state.stageNumber,
              stars,
              state.timeElapsedSeconds,
            );
        }

        AdService.showInterstitialIfEligible();

        set({
          board: newBoard,
          status: 'victory',
          remainingCounts,
          praiseToast: praiseEngine.getVictoryHype(),
          history: newHistory,
          sameNumberIndices: getMatchingValueIndices(newBoard, num),
        });
        return;
      }

      set({
        board: newBoard,
        remainingCounts,
        praiseToast: praise,
        history: newHistory,
        sameNumberIndices: getMatchingValueIndices(newBoard, num),
      });
    },

    eraseCell: () => {
      const { selectedCellIndex, board, history, status } = get();
      if (selectedCellIndex === null || status !== 'playing') return;

      const cell = board[selectedCellIndex];
      if (cell.isInitial || (cell.value === 0 && cell.notes.length === 0)) return;

      hapticService.tap();
      const newBoard = board.map((c) => ({ ...c, notes: [...c.notes] }));
      const target = newBoard[selectedCellIndex];
      const prevVal = target.value;
      const prevNotes = [...target.notes];

      target.value = 0;
      target.isError = false;
      target.notes = [];

      const remainingCounts = getRemainingNumbersCount(newBoard);

      set({
        board: newBoard,
        remainingCounts,
        sameNumberIndices: new Set(),
        history: [
          ...history,
          {
            index: selectedCellIndex,
            prevValue: prevVal,
            newValue: 0,
            prevNotes,
            newNotes: [],
          },
        ],
      });
    },

    undo: () => {
      const { history, board, status } = get();
      if (history.length === 0 || status !== 'playing') return;

      hapticService.tap();
      const lastMove = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      const newBoard = board.map((c) => ({ ...c, notes: [...c.notes] }));

      const target = newBoard[lastMove.index];
      target.value = lastMove.prevValue;
      target.isError = false;
      target.notes = [...lastMove.prevNotes];

      const remainingCounts = getRemainingNumbersCount(newBoard);

      set({
        board: newBoard,
        history: newHistory,
        remainingCounts,
        selectedCellIndex: lastMove.index,
        sameNumberIndices:
          lastMove.prevValue > 0
            ? getMatchingValueIndices(newBoard, lastMove.prevValue)
            : new Set(),
      });
    },

    useSmartHint: async () => {
      const { board, selectedCellIndex, status } = get();
      if (status !== 'playing') return;

      let targetIdx = selectedCellIndex;
      if (targetIdx === null || board[targetIdx].isInitial || board[targetIdx].value !== 0) {
        // Find first empty cell
        targetIdx = board.findIndex((c) => !c.isInitial && c.value === 0);
      }

      if (targetIdx === -1) return;

      const applyHint = () => {
        const currentBoard = get().board;
        hapticService.sectionClear();
        const newBoard = currentBoard.map((c) => ({ ...c, notes: [...c.notes] }));
        const target = newBoard[targetIdx!];
        target.value = target.solutionValue;
        target.isError = false;
        target.notes = [];

        const remainingCounts = getRemainingNumbersCount(newBoard);
        const isSolved = isBoardSolved(newBoard);

        set({
          board: newBoard,
          remainingCounts,
          selectedCellIndex: targetIdx,
          status: isSolved ? 'victory' : 'playing',
          praiseToast: {
            text: 'Smart Hint Unlocked!',
            emoji: '💡',
            subtext: `Placed ${target.solutionValue} in Row ${target.row + 1}, Col ${target.col + 1}`,
          },
        });
      };

      await AdService.showRewardedAdForHint(
        () => applyHint(),
        () => applyHint(), // offline fallback pass
      );
    },

    pauseGame: () => {
      clearTimer();
      set({ status: 'paused' });
    },

    resumeGame: () => {
      set({ status: 'playing' });
      startTimer();
    },

    tickTimer: () => {
      const state = get();
      if (state.status !== 'playing') return;

      const newRemaining = state.timeRemainingSeconds - 1;
      const newElapsed = state.timeElapsedSeconds + 1;

      // When timer hits 0: pause and show overtime prompt
      if (newRemaining <= 0) {
        clearTimer();
        hapticService.error();
        set({
          timeRemainingSeconds: 0,
          timeElapsedSeconds: newElapsed,
          status: 'overtime_prompt',
          praiseToast: praiseEngine.getOvertimeCushion(),
        });
        return;
      }

      // Positive reinforcement at 1 minute mark
      if (newRemaining === 60) {
        set({
          timeRemainingSeconds: newRemaining,
          timeElapsedSeconds: newElapsed,
          praiseToast: praiseEngine.getTimeWarningPraise(),
        });
        return;
      }

      set({
        timeRemainingSeconds: newRemaining,
        timeElapsedSeconds: newElapsed,
      });
    },

    requestExtraTimeWithAd: async () => {
      const state = get();
      const extraSeconds = SUDOKU_TIER_CONFIG[state.difficulty].extensionSeconds;

      const grantTime = () => {
        set((s) => ({
          timeRemainingSeconds: s.timeRemainingSeconds + extraSeconds,
          overtimeCount: s.overtimeCount + 1,
          status: 'playing',
          praiseToast: {
            text: 'Bonus Time Added!',
            emoji: '⏰',
            subtext: `+${Math.floor(extraSeconds / 60)}:00 added. Clutch the win!`,
          },
        }));
        startTimer();
      };

      return AdService.showRewardedAdForTimeExtension(
        () => grantTime(),
        () => grantTime(), // offline / fallback pass
      );
    },

    restartGame: () => {
      const state = get();
      if (!state.currentPuzzle) return;
      state.startNewGame(state.currentPuzzle, state.isCampaign);
    },

    dismissPraiseToast: () => {
      set({ praiseToast: null });
    },
  };
});
