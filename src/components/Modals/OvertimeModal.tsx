import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { useThemeStore } from '../../store/useThemeStore';
import { SUDOKU_TIER_CONFIG } from '../../engine/sudokuLogic';

interface OvertimeModalProps {
  visible: boolean;
  onExitToMenu: () => void;
}

export const OvertimeModal: React.FC<OvertimeModalProps> = ({
  visible,
  onExitToMenu,
}) => {
  const colors = useThemeStore((s) => s.colors);
  const difficulty = useGameStore((s) => s.difficulty);
  const requestExtraTimeWithAd = useGameStore((s) => s.requestExtraTimeWithAd);
  const restartGame = useGameStore((s) => s.restartGame);

  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const tierConfig = SUDOKU_TIER_CONFIG[difficulty];
  const bonusMins = Math.floor(tierConfig.extensionSeconds / 60);

  const handleWatchAd = async () => {
    setIsLoadingAd(true);
    try {
      await requestExtraTimeWithAd();
    } finally {
      setIsLoadingAd(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.gold }]}>
          <Text style={styles.clockEmoji}>⏳</Text>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Time's Up!
          </Text>

          <Text style={[styles.subtext, { color: colors.textSecondary }]}>
            You were making great moves on this board! Extend your clock to finish strong and keep your streak alive.
          </Text>

          {/* Primary Action: Watch Ad for Extra Time */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isLoadingAd}
            onPress={handleWatchAd}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            {isLoadingAd ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.btnIcon}>📺</Text>
                <Text style={styles.primaryBtnText}>
                  Watch Video for +{bonusMins}:00 Extra Time
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={restartGame}
              style={[styles.secondaryBtn, { backgroundColor: colors.surfaceBg, borderColor: colors.divider }]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>
                🔄 Restart
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onExitToMenu}
              style={[styles.secondaryBtn, { backgroundColor: colors.surfaceBg, borderColor: colors.divider }]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>
                🏠 Menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  clockEmoji: {
    fontSize: 54,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  secondaryBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
