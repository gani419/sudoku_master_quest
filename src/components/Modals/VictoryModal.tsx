import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { useThemeStore } from '../../store/useThemeStore';
import { calculateStars, formatTime, SUDOKU_TIER_CONFIG } from '../../engine/sudokuLogic';

interface VictoryModalProps {
  visible: boolean;
  onNextStage: () => void;
  onExitToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  visible,
  onNextStage,
  onExitToMenu,
}) => {
  const colors = useThemeStore((s) => s.colors);
  const difficulty = useGameStore((s) => s.difficulty);
  const timeElapsed = useGameStore((s) => s.timeElapsedSeconds);
  const mistakes = useGameStore((s) => s.mistakes);
  const stageNumber = useGameStore((s) => s.stageNumber);
  const isCampaign = useGameStore((s) => s.isCampaign);
  const isBonus = useGameStore((s) => s.isBonusStage);

  const stars = calculateStars(timeElapsed, mistakes, difficulty);
  const tierConfig = SUDOKU_TIER_CONFIG[difficulty];
  const isStage10Complete = isCampaign && stageNumber === 10;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.gold }]}>
          <Text style={styles.trophyEmoji}>🏆</Text>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {isBonus ? 'BONUS CONQUERED!' : 'VICTORY!'}
          </Text>

          <Text style={[styles.subtitle, { color: colors.accent }]}>
            {tierConfig.badgeTitle} Energy
          </Text>

          {/* Star Ratings */}
          <View style={styles.starsRow}>
            {[1, 2, 3].map((star) => (
              <Text
                key={star}
                style={[
                  styles.starEmoji,
                  { opacity: star <= stars ? 1 : 0.25 },
                ]}
              >
                ⭐
              </Text>
            ))}
          </View>

          {/* Stats Box */}
          <View style={[styles.statsBox, { backgroundColor: colors.surfaceBg }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Time</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {formatTime(timeElapsed)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Mistakes</Text>
              <Text style={[styles.statValue, { color: mistakes === 0 ? colors.success : colors.danger }]}>
                {mistakes === 0 ? 'Clean (0)' : mistakes}
              </Text>
            </View>
          </View>

          {/* Bonus Stage notification if stage 10 */}
          {isStage10Complete && (
            <View style={[styles.bonusBanner, { backgroundColor: colors.accentGlow, borderColor: colors.accent }]}>
              <Text style={styles.bonusBannerIcon}>🌟</Text>
              <Text style={[styles.bonusBannerText, { color: colors.accent }]}>
                Secret Bonus Stage Unlocked for this Tier!
              </Text>
            </View>
          )}

          {/* Next Stage Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onNextStage}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.primaryBtnText}>
              {isStage10Complete ? 'Claim & Continue' : 'Next Stage →'}
            </Text>
          </TouchableOpacity>

          {/* Menu Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onExitToMenu}
            style={[styles.menuBtn, { backgroundColor: colors.surfaceBg }]}
          >
            <Text style={[styles.menuBtnText, { color: colors.textSecondary }]}>
              Return to Menu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  trophyEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  starEmoji: {
    fontSize: 36,
    marginHorizontal: 4,
  },
  statsBox: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 18,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(150,150,150,0.3)',
  },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  bonusBannerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  bonusBannerText: {
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  menuBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
