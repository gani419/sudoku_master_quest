import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { storage, StorageKeys } from './storage';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const hapticService = {
  isEnabled: (): boolean => {
    return storage.getBoolean(StorageKeys.HAPTICS_ENABLED) ?? true;
  },

  toggle: (): boolean => {
    const current = hapticService.isEnabled();
    const next = !current;
    storage.set(StorageKeys.HAPTICS_ENABLED, next);
    return next;
  },

  tap: () => {
    if (!hapticService.isEnabled()) return;
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
  },

  cellSelect: () => {
    if (!hapticService.isEnabled()) return;
    ReactNativeHapticFeedback.trigger('selection', hapticOptions);
  },

  numberInput: () => {
    if (!hapticService.isEnabled()) return;
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
  },

  error: () => {
    if (!hapticService.isEnabled()) return;
    ReactNativeHapticFeedback.trigger('notificationError', hapticOptions);
  },

  sectionClear: () => {
    if (!hapticService.isEnabled()) return;
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
  },

  victory: () => {
    if (!hapticService.isEnabled()) return;
    ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
  },
};
