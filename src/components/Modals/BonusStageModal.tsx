import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { Difficulty } from '../../types/game';
import { SUDOKU_TIER_CONFIG } from '../../engine/sudokuLogic';
import { AdService } from '../../services/adService';
import { useCampaignStore } from '../../store/useCampaignStore';

interface BonusStageModalProps {
  visible: boolean;
  tier: Difficulty;
  onUnlockedAndPlay: () => void;
  onClose: () => void;
}

export const BonusStageModal: React.FC<BonusStageModalProps> = ({
  visible,
  tier,
  onUnlockedAndPlay,
  onClose,
}) => {
  const colors = useThemeStore((s) => s.colors);
  const unlockBonusStage = useCampaignStore((s) => s.unlockBonusStage);
  const [loadingAd, setLoadingAd] = useState(false);

  const tierConfig = SUDOKU_TIER_CONFIG[tier];

  const handleUnlock = async () => {
    setLoadingAd(true);
    try {
      const grantUnlock = () => {
        unlockBonusStage(tier);
        onUnlockedAndPlay();
      };

      await AdService.showRewardedAdForBonusStage(
        () => grantUnlock(),
        () => grantUnlock(), // offline fallback pass
      );
    } finally {
      setLoadingAd(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.gold }]}>
          <Text style={styles.icon}>🌟</Text>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Secret Boss Stage
          </Text>

          <Text style={[styles.subtitle, { color: colors.accent }]}>
            {tierConfig.name} Master Challenge
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            You proved yourself across 10 stages! Watch a short video to unlock the legendary Bonus Boss Stage and earn an exclusive Golden Star.
          </Text>

          {/* Watch Ad to Unlock Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={loadingAd}
            onPress={handleUnlock}
            style={[styles.primaryBtn, { backgroundColor: colors.gold }]}
          >
            {loadingAd ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.btnIcon}>📺</Text>
                <Text style={styles.primaryBtnText}>
                  Watch Video to Unlock Stage
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Close / Later Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={[styles.cancelBtn, { backgroundColor: colors.surfaceBg }]}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>
              Maybe Later
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
  icon: {
    fontSize: 54,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 6,
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
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  primaryBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
