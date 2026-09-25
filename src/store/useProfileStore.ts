import { create } from 'zustand';
import { BadgeId, Difficulty, TierStats, UserProfile } from '../types/game';
import { storage, StorageKeys } from '../services/storage';

export const AVATAR_LIST = [
  { id: 'avatar_1', name: 'Cyber Ninja', icon: '🥷' },
  { id: 'avatar_2', name: 'Pixel Knight', icon: '🛡️' },
  { id: 'avatar_3', name: 'Galaxy Brain', icon: '🧠' },
  { id: 'avatar_4', name: 'Chill Capybara', icon: '🦫' },
  { id: 'avatar_5', name: 'Neon Bot', icon: '🤖' },
  { id: 'avatar_6', name: 'Mystic Wizard', icon: '🧙' },
  { id: 'avatar_7', name: 'Speed Demon', icon: '⚡' },
  { id: 'avatar_8', name: 'The GOAT', icon: '🐐' },
];

export const BADGE_DETAILS: Record<
  BadgeId,
  { title: string; requiredTier: Difficulty | 'none'; desc: string; icon: string }
> = {
  rookie: {
    title: 'Rookie',
    requiredTier: 'none',
    desc: 'Joined the Quest',
    icon: '🌱',
  },
  casual_brain: {
    title: 'Casual Brain',
    requiredTier: 'noob',
    desc: 'Mastered 10 Noob Stages',
    icon: '✨',
  },
  locked_in: {
    title: 'Locked In',
    requiredTier: 'grinder',
    desc: 'Conquered 10 Grinder Stages',
    icon: '🎯',
  },
  galaxy_brain: {
    title: 'Galaxy Brain',
    requiredTier: 'nerd',
    desc: 'Solved 10 Nerd Stages',
    icon: '🌌',
  },
  sudoku_demon: {
    title: 'Sudoku Demon',
    requiredTier: 'pro',
    desc: 'Destroyed 10 Pro Stages',
    icon: '😈',
  },
  the_goat: {
    title: 'The GOAT',
    requiredTier: 'goat',
    desc: 'Achieved Legendary Status',
    icon: '🐐',
  },
};

const createInitialStats = (): Record<Difficulty, TierStats> => ({
  noob: { gamesPlayed: 0, gamesWon: 0, bestTimeSeconds: null, totalTimeSeconds: 0, totalMistakes: 0, cleanRuns: 0 },
  grinder: { gamesPlayed: 0, gamesWon: 0, bestTimeSeconds: null, totalTimeSeconds: 0, totalMistakes: 0, cleanRuns: 0 },
  nerd: { gamesPlayed: 0, gamesWon: 0, bestTimeSeconds: null, totalTimeSeconds: 0, totalMistakes: 0, cleanRuns: 0 },
  pro: { gamesPlayed: 0, gamesWon: 0, bestTimeSeconds: null, totalTimeSeconds: 0, totalMistakes: 0, cleanRuns: 0 },
  goat: { gamesPlayed: 0, gamesWon: 0, bestTimeSeconds: null, totalTimeSeconds: 0, totalMistakes: 0, cleanRuns: 0 },
});

const getStoredProfile = (): UserProfile => {
  const data = storage.getString(StorageKeys.USER_PROFILE);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  return {
    name: 'Player',
    gamerTag: 'Sudoku_Rookie',
    avatarId: 'avatar_1',
    currentBadge: 'rookie',
    unlockedBadges: ['rookie'],
    starsCollected: 0,
    streakDays: 1,
    lastPlayedDate: new Date().toISOString().split('T')[0],
    hasSeenOnboarding: false,
    stats: createInitialStats(),
  };
};

interface ProfileActions {
  updateNameAndTag: (name: string, gamerTag: string) => void;
  setAvatar: (avatarId: string) => void;
  recordGameFinished: (
    difficulty: Difficulty,
    won: boolean,
    timeSeconds: number,
    mistakes: number,
  ) => void;
  unlockBadge: (badge: BadgeId) => void;
  setEquippedBadge: (badge: BadgeId) => void;
  setOnboardingCompleted: () => void;
}

export const useProfileStore = create<UserProfile & ProfileActions>((set, get) => {
  const initial = getStoredProfile();

  const persist = (profile: UserProfile) => {
    storage.set(StorageKeys.USER_PROFILE, JSON.stringify(profile));
  };

  return {
    ...initial,

    updateNameAndTag: (name: string, gamerTag: string) => {
      set((state) => {
        const updated = { ...state, name: name.trim() || 'Player', gamerTag: gamerTag.trim() || 'Player_1' };
        persist(updated);
        return updated;
      });
    },

    setAvatar: (avatarId: string) => {
      set((state) => {
        const updated = { ...state, avatarId };
        persist(updated);
        return updated;
      });
    },

    setEquippedBadge: (badge: BadgeId) => {
      set((state) => {
        if (!state.unlockedBadges.includes(badge)) return state;
        const updated = { ...state, currentBadge: badge };
        persist(updated);
        return updated;
      });
    },

    unlockBadge: (badge: BadgeId) => {
      set((state) => {
        if (state.unlockedBadges.includes(badge)) return state;
        const updatedBadges = [...state.unlockedBadges, badge];
        const updated = {
          ...state,
          unlockedBadges: updatedBadges,
          currentBadge: badge, // Auto-equip newest unlocked badge
        };
        persist(updated);
        return updated;
      });
    },

    setOnboardingCompleted: () => {
      set((state) => {
        const updated = { ...state, hasSeenOnboarding: true };
        storage.set(StorageKeys.HAS_SEEN_ONBOARDING, true);
        persist(updated);
        return updated;
      });
    },

    recordGameFinished: (
      difficulty: Difficulty,
      won: boolean,
      timeSeconds: number,
      mistakes: number,
    ) => {
      set((state) => {
        const tierStat = state.stats[difficulty] || {
          gamesPlayed: 0,
          gamesWon: 0,
          bestTimeSeconds: null,
          totalTimeSeconds: 0,
          totalMistakes: 0,
          cleanRuns: 0,
        };

        const updatedTier: TierStats = {
          gamesPlayed: tierStat.gamesPlayed + 1,
          gamesWon: won ? tierStat.gamesWon + 1 : tierStat.gamesWon,
          bestTimeSeconds: won
            ? tierStat.bestTimeSeconds === null
              ? timeSeconds
              : Math.min(tierStat.bestTimeSeconds, timeSeconds)
            : tierStat.bestTimeSeconds,
          totalTimeSeconds: won ? tierStat.totalTimeSeconds + timeSeconds : tierStat.totalTimeSeconds,
          totalMistakes: tierStat.totalMistakes + mistakes,
          cleanRuns: won && mistakes === 0 ? tierStat.cleanRuns + 1 : tierStat.cleanRuns,
        };

        // Streak calculation
        const today = new Date().toISOString().split('T')[0];
        let streak = state.streakDays;
        if (state.lastPlayedDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          streak = state.lastPlayedDate === yesterday ? streak + 1 : 1;
        }

        const updated: UserProfile = {
          ...state,
          streakDays: streak,
          lastPlayedDate: today,
          stats: {
            ...state.stats,
            [difficulty]: updatedTier,
          },
        };

        persist(updated);
        return updated;
      });
    },
  };
});
