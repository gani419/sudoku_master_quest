import { create } from 'zustand';
import { Difficulty, CampaignStageProgress, BadgeId } from '../types/game';
import { storage, StorageKeys } from '../services/storage';
import { useProfileStore } from './useProfileStore';

export const CAMPAIGN_TIERS: Difficulty[] = ['noob', 'grinder', 'nerd', 'pro', 'goat'];

const BADGE_MAP: Record<Difficulty, BadgeId> = {
  noob: 'casual_brain',
  grinder: 'locked_in',
  nerd: 'galaxy_brain',
  pro: 'sudoku_demon',
  goat: 'the_goat',
};

interface CampaignState {
  currentTier: Difficulty;
  unlockedTiers: Difficulty[];
  stages: Record<string, CampaignStageProgress>; // Key: `${tier}_${stageNumber}`
  bonusStagesUnlocked: Record<Difficulty, boolean>;
  
  // Actions
  setCurrentTier: (tier: Difficulty) => void;
  recordStageComplete: (
    tier: Difficulty,
    stageNumber: number,
    stars: number,
    timeSeconds: number,
  ) => { unlockedNextTier: boolean; unlockedBadge: BadgeId | null };
  unlockBonusStage: (tier: Difficulty) => void;
  getTierProgress: (tier: Difficulty) => { completedCount: number; totalStars: number };
}

const getStoredCampaign = () => {
  const data = storage.getString(StorageKeys.CAMPAIGN_PROGRESS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  return {
    currentTier: 'noob' as Difficulty,
    unlockedTiers: ['noob'] as Difficulty[],
    stages: {} as Record<string, CampaignStageProgress>,
    bonusStagesUnlocked: {
      noob: false,
      grinder: false,
      nerd: false,
      pro: false,
      goat: false,
    },
  };
};

export const useCampaignStore = create<CampaignState>((set, get) => {
  const initial = getStoredCampaign();

  const persist = (state: CampaignState) => {
    storage.set(
      StorageKeys.CAMPAIGN_PROGRESS,
      JSON.stringify({
        currentTier: state.currentTier,
        unlockedTiers: state.unlockedTiers,
        stages: state.stages,
        bonusStagesUnlocked: state.bonusStagesUnlocked,
      }),
    );
  };

  return {
    ...initial,

    setCurrentTier: (tier: Difficulty) => {
      set({ currentTier: tier });
    },

    unlockBonusStage: (tier: Difficulty) => {
      set((state) => {
        const updated = {
          ...state,
          bonusStagesUnlocked: {
            ...state.bonusStagesUnlocked,
            [tier]: true,
          },
        };
        persist(updated);
        return updated;
      });
    },

    recordStageComplete: (tier, stageNumber, stars, timeSeconds) => {
      const key = `${tier}_${stageNumber}`;
      let unlockedNextTier = false;
      let unlockedBadge: BadgeId | null = null;

      set((state) => {
        const existing = state.stages[key];
        const newStars = Math.max(existing?.stars || 0, stars);
        const bestTime =
          existing?.bestTimeSeconds !== null && existing?.bestTimeSeconds !== undefined
            ? Math.min(existing.bestTimeSeconds, timeSeconds)
            : timeSeconds;

        const updatedStages = {
          ...state.stages,
          [key]: {
            stageId: key,
            difficulty: tier,
            stageNumber,
            stars: newStars,
            completed: true,
            bestTimeSeconds: bestTime,
          },
        };

        // Check if all 10 stages of this tier are completed
        let tierCompleted = true;
        for (let i = 1; i <= 10; i++) {
          if (!updatedStages[`${tier}_${i}`]?.completed) {
            tierCompleted = false;
            break;
          }
        }

        let updatedUnlockedTiers = [...state.unlockedTiers];
        if (tierCompleted) {
          unlockedBadge = BADGE_MAP[tier];
          useProfileStore.getState().unlockBadge(unlockedBadge);

          // Unlock next tier if available
          const currentIndex = CAMPAIGN_TIERS.indexOf(tier);
          if (currentIndex < CAMPAIGN_TIERS.length - 1) {
            const nextTier = CAMPAIGN_TIERS[currentIndex + 1];
            if (!updatedUnlockedTiers.includes(nextTier)) {
              updatedUnlockedTiers.push(nextTier);
              unlockedNextTier = true;
            }
          }
        }

        const nextState = {
          ...state,
          stages: updatedStages,
          unlockedTiers: updatedUnlockedTiers,
        };
        persist(nextState);
        return nextState;
      });

      return { unlockedNextTier, unlockedBadge };
    },

    getTierProgress: (tier: Difficulty) => {
      const state = get();
      let completedCount = 0;
      let totalStars = 0;
      for (let i = 1; i <= 10; i++) {
        const stage = state.stages[`${tier}_${i}`];
        if (stage?.completed) {
          completedCount++;
          totalStars += stage.stars;
        }
      }
      return { completedCount, totalStars };
    },
  };
});
