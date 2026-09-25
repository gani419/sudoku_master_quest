import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useProfileStore,
  AVATAR_LIST,
  BADGE_DETAILS,
} from '../../store/useProfileStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Difficulty, BadgeId } from '../../types/game';
import { formatTime, SUDOKU_TIER_CONFIG } from '../../engine/sudokuLogic';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const TIERS: Difficulty[] = ['noob', 'grinder', 'nerd', 'pro', 'goat'];

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const colors = useThemeStore((s) => s.colors);

  const name = useProfileStore((s) => s.name);
  const gamerTag = useProfileStore((s) => s.gamerTag);
  const avatarId = useProfileStore((s) => s.avatarId);
  const currentBadge = useProfileStore((s) => s.currentBadge);
  const unlockedBadges = useProfileStore((s) => s.unlockedBadges);
  const streakDays = useProfileStore((s) => s.streakDays);
  const stats = useProfileStore((s) => s.stats);

  const updateNameAndTag = useProfileStore((s) => s.updateNameAndTag);
  const setAvatar = useProfileStore((s) => s.setAvatar);
  const setEquippedBadge = useProfileStore((s) => s.setEquippedBadge);

  const [editName, setEditName] = useState(name);
  const [editTag, setEditTag] = useState(gamerTag);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = () => {
    updateNameAndTag(editName, editTag);
    setIsEditing(false);
  };

  // Calculate total games and win rate
  let totalGames = 0;
  let totalWins = 0;
  TIERS.forEach((t) => {
    totalGames += stats[t]?.gamesPlayed || 0;
    totalWins += stats[t]?.gamesWon || 0;
  });
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: colors.cardBg, borderColor: colors.divider }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Gamer Hub
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                Profile & Offline Stats
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceBg }]}
            >
              <Text style={[styles.closeText, { color: colors.textPrimary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Identity Card */}
            <View style={[styles.identityCard, { backgroundColor: colors.surfaceBg, borderColor: colors.accent }]}>
              <View style={styles.avatarRow}>
                <View style={[styles.avatarBubble, { backgroundColor: colors.cardBg, borderColor: colors.accent }]}>
                  <Text style={styles.avatarLarge}>
                    {AVATAR_LIST.find((a) => a.id === avatarId)?.icon || '🥷'}
                  </Text>
                </View>

                <View style={styles.nameDetails}>
                  {isEditing ? (
                    <View>
                      <TextInput
                        style={[styles.input, { color: colors.textPrimary, borderColor: colors.accent }]}
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="Player Name"
                        placeholderTextColor={colors.textMuted}
                      />
                      <TextInput
                        style={[styles.input, { color: colors.accent, borderColor: colors.accent, marginTop: 6 }]}
                        value={editTag}
                        onChangeText={setEditTag}
                        placeholder="Gamer Tag"
                        placeholderTextColor={colors.textMuted}
                      />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleSaveProfile}
                        style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                      >
                        <Text style={styles.saveBtnText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.nameRow}>
                        <Text style={[styles.profileName, { color: colors.textPrimary }]}>
                          {name}
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setIsEditing(true)}
                          style={styles.editIconBtn}
                        >
                          <Text style={{ fontSize: 14 }}>✏️</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.profileTag, { color: colors.accent }]}>
                        @{gamerTag}
                      </Text>
                      <View style={[styles.badgeTag, { backgroundColor: colors.accentGlow }]}>
                        <Text style={[styles.badgeTagText, { color: colors.accent }]}>
                          {BADGE_DETAILS[currentBadge]?.icon} {BADGE_DETAILS[currentBadge]?.title}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Avatar Selector */}
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Choose Your Gamer Avatar
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
                {AVATAR_LIST.map((av) => (
                  <TouchableOpacity
                    key={av.id}
                    activeOpacity={0.7}
                    onPress={() => setAvatar(av.id)}
                    style={[
                      styles.avatarSelectBtn,
                      {
                        backgroundColor: avatarId === av.id ? colors.accentGlow : colors.cardBg,
                        borderColor: avatarId === av.id ? colors.accent : colors.divider,
                      },
                    ]}
                  >
                    <Text style={styles.avatarSelectIcon}>{av.icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quick Metrics Bar */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { backgroundColor: colors.surfaceBg }]}>
                <Text style={styles.metricEmoji}>🔥</Text>
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{streakDays}d</Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Streak</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: colors.surfaceBg }]}>
                <Text style={styles.metricEmoji}>🎮</Text>
                <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{totalGames}</Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Played</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: colors.surfaceBg }]}>
                <Text style={styles.metricEmoji}>🎯</Text>
                <Text style={[styles.metricVal, { color: colors.success }]}>{winRate}%</Text>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Win Rate</Text>
              </View>
            </View>

            {/* Badges & Titles Showcase */}
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              Trophy Badges
            </Text>
            <View style={styles.badgesGrid}>
              {(Object.keys(BADGE_DETAILS) as BadgeId[]).map((badgeKey) => {
                const badge = BADGE_DETAILS[badgeKey];
                const isUnlocked = unlockedBadges.includes(badgeKey);
                const isEquipped = currentBadge === badgeKey;

                return (
                  <TouchableOpacity
                    key={badgeKey}
                    activeOpacity={0.7}
                    disabled={!isUnlocked}
                    onPress={() => setEquippedBadge(badgeKey)}
                    style={[
                      styles.badgeCard,
                      {
                        backgroundColor: isUnlocked ? colors.surfaceBg : colors.background,
                        borderColor: isEquipped ? colors.accent : isUnlocked ? colors.divider : colors.divider,
                        opacity: isUnlocked ? 1 : 0.45,
                      },
                    ]}
                  >
                    <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                    <Text style={[styles.badgeTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {badge.title}
                    </Text>
                    <Text style={[styles.badgeDesc, { color: colors.textMuted }]} numberOfLines={1}>
                      {isUnlocked ? (isEquipped ? 'Equipped' : 'Tap to Equip') : 'Locked'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Solving Speed Analytics by Tier */}
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              Solving Speed & Analytics
            </Text>
            {TIERS.map((tier) => {
              const tierStat = stats[tier];
              const config = SUDOKU_TIER_CONFIG[tier];
              const avgSeconds =
                tierStat?.gamesWon > 0
                  ? Math.round(tierStat.totalTimeSeconds / tierStat.gamesWon)
                  : null;

              return (
                <View
                  key={tier}
                  style={[styles.tierStatCard, { backgroundColor: colors.surfaceBg, borderColor: colors.divider }]}
                >
                  <View style={styles.tierHeader}>
                    <Text style={[styles.tierTitle, { color: colors.textPrimary }]}>
                      {config.name}
                    </Text>
                    <Text style={[styles.tierWonBadge, { color: colors.accent }]}>
                      {tierStat?.gamesWon || 0} Wins
                    </Text>
                  </View>

                  <View style={styles.tierMetrics}>
                    <View style={styles.tierMetricItem}>
                      <Text style={[styles.tierMetricLabel, { color: colors.textMuted }]}>
                        ⚡ Best Time
                      </Text>
                      <Text style={[styles.tierMetricVal, { color: colors.gold }]}>
                        {tierStat?.bestTimeSeconds !== null
                          ? formatTime(tierStat.bestTimeSeconds)
                          : '--:--'}
                      </Text>
                    </View>

                    <View style={styles.tierMetricItem}>
                      <Text style={[styles.tierMetricLabel, { color: colors.textMuted }]}>
                        ⏱️ Avg Speed
                      </Text>
                      <Text style={[styles.tierMetricVal, { color: colors.textPrimary }]}>
                        {avgSeconds !== null ? formatTime(avgSeconds) : '--:--'}
                      </Text>
                    </View>

                    <View style={styles.tierMetricItem}>
                      <Text style={[styles.tierMetricLabel, { color: colors.textMuted }]}>
                        🛡️ Clean Runs
                      </Text>
                      <Text style={[styles.tierMetricVal, { color: colors.success }]}>
                        {tierStat?.cleanRuns || 0}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  identityCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 14,
  },
  avatarLarge: {
    fontSize: 34,
  },
  nameDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
  editIconBtn: {
    padding: 4,
  },
  profileTag: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  input: {
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
  },
  avatarScroll: {
    flexDirection: 'row',
  },
  avatarSelectBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1.5,
  },
  avatarSelectIcon: {
    fontSize: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  metricEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  badgeCard: {
    width: '31%',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
  },
  badgeEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  tierStatCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  tierWonBadge: {
    fontSize: 12,
    fontWeight: '800',
  },
  tierMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  tierMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  tierMetricVal: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
