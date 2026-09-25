import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useProfileStore, AVATAR_LIST } from '../../store/useProfileStore';
import { formatTime, SUDOKU_TIER_CONFIG } from '../../engine/sudokuLogic';

interface AppHeaderProps {
  onBack?: () => void;
  onOpenProfile: () => void;
  isGameScreen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onBack,
  onOpenProfile,
  isGameScreen = false,
}) => {
  const colors = useThemeStore((s) => s.colors);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const timeRemaining = useGameStore((s) => s.timeRemainingSeconds);
  const mistakes = useGameStore((s) => s.mistakes);
  const maxMistakes = useGameStore((s) => s.maxMistakesAllowed);
  const difficulty = useGameStore((s) => s.difficulty);
  const stageNumber = useGameStore((s) => s.stageNumber);
  const isBonus = useGameStore((s) => s.isBonusStage);

  const avatarId = useProfileStore((s) => s.avatarId);
  const gamerTag = useProfileStore((s) => s.gamerTag);
  const currentBadge = useProfileStore((s) => s.currentBadge);

  const currentAvatar = AVATAR_LIST.find((a) => a.id === avatarId)?.icon || '🥷';
  const isTimeWarning = timeRemaining <= 60 && timeRemaining > 0;

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
      {/* Left side: Back button or App Logo */}
      <View style={styles.leftContainer}>
        {onBack ? (
          <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backArrow, { color: colors.accent }]}>←</Text>
            <View>
              <Text style={[styles.stageTitle, { color: colors.textPrimary }]}>
                {isBonus
                  ? '🌟 BONUS STAGE'
                  : stageNumber
                  ? `Stage ${stageNumber}`
                  : SUDOKU_TIER_CONFIG[difficulty]?.name}
              </Text>
              <Text style={[styles.stageSubtitle, { color: colors.textMuted }]}>
                {SUDOKU_TIER_CONFIG[difficulty]?.name.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.branding}>
            <Text style={styles.brandEmoji}>🐐</Text>
            <View>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                Sudoku <Text style={{ color: colors.accent }}>GOAT</Text>
              </Text>
              <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                Master Quest
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Center: Live Timer & Mistakes when in game */}
      {isGameScreen && (
        <View style={styles.gameStats}>
          <View
            style={[
              styles.timerPill,
              {
                backgroundColor: isTimeWarning ? colors.cellErrorBg : colors.surfaceBg,
                borderColor: isTimeWarning ? colors.danger : colors.divider,
              },
            ]}
          >
            <Text style={styles.timerIcon}>{isTimeWarning ? '🔥' : '⏱️'}</Text>
            <Text
              style={[
                styles.timerText,
                {
                  color: isTimeWarning ? colors.danger : colors.textPrimary,
                },
              ]}
            >
              {formatTime(timeRemaining)}
            </Text>
          </View>

          <Text style={[styles.mistakesText, { color: colors.textMuted }]}>
            {maxMistakes === Infinity
              ? '🧘 Chill'
              : `Mistakes: ${mistakes}/${maxMistakes}`}
          </Text>
        </View>
      )}

      {/* Right side: Theme Switcher & Gamer Dashboard Button */}
      <View style={styles.rightContainer}>
        {/* Instant Theme Toggle Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleTheme}
          style={[styles.themeBtn, { backgroundColor: colors.surfaceBg, borderColor: colors.divider }]}
          accessibilityLabel="Toggle Theme"
        >
          <Text style={styles.themeIcon}>{themeMode === 'dark' ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        {/* Gamer Profile / Analytics Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenProfile}
          style={[styles.profileBtn, { backgroundColor: colors.surfaceBg, borderColor: colors.accent }]}
          accessibilityLabel="Open Gamer Profile"
        >
          <Text style={styles.avatarIcon}>{currentAvatar}</Text>
          <View style={[styles.badgeDot, { backgroundColor: colors.accent }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 26,
    fontWeight: '800',
    marginRight: 8,
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  stageSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandEmoji: {
    fontSize: 30,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gameStats: {
    alignItems: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  timerIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  timerText: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  mistakesText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  themeIcon: {
    fontSize: 18,
  },
  profileBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  avatarIcon: {
    fontSize: 22,
  },
  badgeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    position: 'absolute',
    top: 1,
    right: 1,
  },
});
