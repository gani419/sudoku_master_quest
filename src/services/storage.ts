import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'sudoku-goat-storage',
});

export const StorageKeys = {
  THEME_MODE: 'theme_mode',
  CAMPAIGN_PROGRESS: 'campaign_progress',
  USER_PROFILE: 'user_profile',
  ACTIVE_GAME: 'active_game',
  SOUND_ENABLED: 'sound_enabled',
  HAPTICS_ENABLED: 'haptics_enabled',
  HAS_SEEN_ONBOARDING: 'has_seen_onboarding',
};
