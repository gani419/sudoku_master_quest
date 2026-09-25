export type Difficulty = 'noob' | 'grinder' | 'nerd' | 'pro' | 'goat';

export type BadgeId = 'rookie' | 'casual_brain' | 'locked_in' | 'galaxy_brain' | 'sudoku_demon' | 'the_goat';

export interface BadgeInfo {
  id: BadgeId;
  title: string;
  tierRequired: Difficulty | 'none';
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface PuzzleData {
  id: string;
  difficulty: Difficulty;
  stageNumber: number | null; // 1-10 for campaign, null for free play
  isBonusStage?: boolean; // Stage 11 unlocked via Ad
  clues: number;
  puzzle: string; // 81 char string
  solution: string; // 81 char string
}

export interface CellState {
  index: number;
  row: number;
  col: number;
  box: number;
  value: number; // 0 if empty, 1-9 if filled
  solutionValue: number;
  isInitial: boolean;
  isError: boolean;
  notes: number[]; // Array of numbers 1-9 for pencil notes
}

export interface MoveHistory {
  index: number;
  prevValue: number;
  newValue: number;
  prevNotes: number[];
  newNotes: number[];
}

export interface TierStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTimeSeconds: number | null;
  totalTimeSeconds: number;
  totalMistakes: number;
  cleanRuns: number; // Won with 0 mistakes
}

export interface UserProfile {
  name: string;
  gamerTag: string;
  avatarId: string;
  currentBadge: BadgeId;
  unlockedBadges: BadgeId[];
  starsCollected: number;
  streakDays: number;
  lastPlayedDate: string;
  hasSeenOnboarding: boolean;
  stats: Record<Difficulty, TierStats>;
}

export interface CampaignStageProgress {
  stageId: string;
  difficulty: Difficulty;
  stageNumber: number;
  stars: number; // 0 = unplayed, 1-3 stars
  completed: boolean;
  bestTimeSeconds: number | null;
  unlockedBonusStage?: boolean;
}
