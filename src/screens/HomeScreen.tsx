import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppHeader } from '../components/Header/AppHeader';
import { AdBanner } from '../components/Ads/AdBanner';
import { useCampaignStore, CAMPAIGN_TIERS } from '../store/useCampaignStore';
import { useThemeStore } from '../store/useThemeStore';
import { useProfileStore } from '../store/useProfileStore';
import { Difficulty, PuzzleData } from '../types/game';
import { formatTime, SUDOKU_TIER_CONFIG } from '../engine/sudokuLogic';
import allPuzzles from '../assets/data/puzzles.json';

interface HomeScreenProps {
  onStartGame: (puzzle: PuzzleData, isCampaign: boolean) => void;
  onOpenProfile: () => void;
  onOpenBonusStagePrompt: (tier: Difficulty) => void;
  onOpenTutorial: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onOpenProfile,
  onOpenBonusStagePrompt,
  onOpenTutorial,
}) => {
  const colors = useThemeStore((s) => s.colors);
  const currentTier = useCampaignStore((s) => s.currentTier);
  const setCurrentTier = useCampaignStore((s) => s.setCurrentTier);
  const unlockedTiers = useCampaignStore((s) => s.unlockedTiers);
  const stages = useCampaignStore((s) => s.stages);
  const bonusStagesUnlocked = useCampaignStore((s) => s.bonusStagesUnlocked);
  const hasSeenOnboarding = useProfileStore((s) => s.hasSeenOnboarding);
  const stats = useProfileStore((s) => s.stats);

  const [activeTab, setActiveTab] = useState<'campaign' | 'freeplay'>('campaign');

  const selectedTier = currentTier;
  const tierConfig = SUDOKU_TIER_CONFIG[selectedTier];

  // Get campaign puzzles for current selected tier
  const tierPuzzles = (allPuzzles as PuzzleData[]).filter(
    (p) => p.difficulty === selectedTier,
  );

  const handleLaunchCampaignStage = (stageNum: number) => {
    const puzzle = tierPuzzles.find((p) => p.stageNumber === stageNum);
    if (puzzle) {
      onStartGame(puzzle, true);
    }
  };

  const handleLaunchBonusStage = () => {
    const isUnlocked = bonusStagesUnlocked[selectedTier];
    if (isUnlocked) {
      const bonusPuzzle = tierPuzzles.find((p) => p.isBonusStage);
      if (bonusPuzzle) {
        onStartGame(bonusPuzzle, true);
      }
    } else {
      onOpenBonusStagePrompt(selectedTier);
    }
  };

  const handleLaunchFreePlay = (tier: Difficulty) => {
    // Pick a random puzzle from this tier
    const pool = (allPuzzles as PuzzleData[]).filter(
      (p) => p.difficulty === tier && !p.isBonusStage,
    );
    const randomPuzzle = pool[Math.floor(Math.random() * pool.length)];
    if (randomPuzzle) {
      onStartGame(randomPuzzle, false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader onOpenProfile={onOpenProfile} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Pilot Game / Tutorial Banner for new players */}
        {!hasSeenOnboarding && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenTutorial}
            style={[styles.tutorialBanner, { backgroundColor: colors.accentGlow, borderColor: colors.accent }]}
          >
            <Text style={styles.tutorialEmoji}>🚀</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tutorialTitle, { color: colors.accent }]}>
                New Recruit? Play Pilot Briefing
              </Text>
              <Text style={[styles.tutorialSubtitle, { color: colors.textSecondary }]}>
                Learn the 9x9 rules and start your streak in 60 seconds!
              </Text>
            </View>
            <Text style={[styles.tutorialArrow, { color: colors.accent }]}>→</Text>
          </TouchableOpacity>
        )}

        {/* Dual Mode Switcher: Campaign vs Free Play */}
        <View style={[styles.modeToggleContainer, { backgroundColor: colors.surfaceBg, borderColor: colors.divider }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('campaign')}
            style={[
              styles.modeTab,
              activeTab === 'campaign' && [styles.activeTab, { backgroundColor: colors.accent }],
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: activeTab === 'campaign' ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              🏆 Campaign Roadmap
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('freeplay')}
            style={[
              styles.modeTab,
              activeTab === 'freeplay' && [styles.activeTab, { backgroundColor: colors.accent }],
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: activeTab === 'freeplay' ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              ⚡ Free Play
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'campaign' ? (
          /* CAMPAIGN MODE VIEW */
          <View>
            {/* Tier Selector Horizontal Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tierScroll}>
              {CAMPAIGN_TIERS.map((tier) => {
                const isUnlocked = unlockedTiers.includes(tier);
                const isSelected = selectedTier === tier;
                const config = SUDOKU_TIER_CONFIG[tier];

                return (
                  <TouchableOpacity
                    key={tier}
                    activeOpacity={0.7}
                    disabled={!isUnlocked}
                    onPress={() => setCurrentTier(tier)}
                    style={[
                      styles.tierPill,
                      {
                        backgroundColor: isSelected
                          ? colors.accent
                          : isUnlocked
                          ? colors.surfaceBg
                          : colors.background,
                        borderColor: isSelected ? colors.accent : colors.divider,
                        opacity: isUnlocked ? 1 : 0.45,
                      },
                    ]}
                  >
                    <Text style={styles.tierPillEmoji}>
                      {tier === 'noob'
                        ? '🌱'
                        : tier === 'grinder'
                        ? '🎯'
                        : tier === 'nerd'
                        ? '🌌'
                        : tier === 'pro'
                        ? '😈'
                        : '🐐'}
                    </Text>
                    <Text
                      style={[
                        styles.tierPillText,
                        { color: isSelected ? '#FFFFFF' : isUnlocked ? colors.textPrimary : colors.textMuted },
                      ]}
                    >
                      {config.name}
                    </Text>
                    {!isUnlocked && <Text style={{ fontSize: 10, marginLeft: 4 }}>🔒</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Tier Header & Summary */}
            <View style={[styles.tierSummaryCard, { backgroundColor: colors.cardBg, borderColor: colors.divider }]}>
              <View>
                <Text style={[styles.tierTitle, { color: colors.textPrimary }]}>
                  {tierConfig.name} Chapter
                </Text>
                <Text style={[styles.tierSubtitle, { color: colors.accent }]}>
                  Title: {tierConfig.badgeTitle} • {Math.floor(tierConfig.baseTimerSeconds / 60)} min timer
                </Text>
              </View>
              <View style={[styles.tierTimerBadge, { backgroundColor: colors.surfaceBg }]}>
                <Text style={[styles.tierTimerText, { color: colors.textSecondary }]}>
                  10 Stages + Bonus
                </Text>
              </View>
            </View>

            {/* Stages Grid (1 to 10) */}
            <View style={styles.stagesGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stageNum) => {
                const stageKey = `${selectedTier}_${stageNum}`;
                const stageData = stages[stageKey];
                const isCompleted = stageData?.completed;
                const stars = stageData?.stars || 0;

                // Stage is accessible if stage 1 or previous stage was completed
                const prevStageCompleted = stageNum === 1 || stages[`${selectedTier}_${stageNum - 1}`]?.completed;
                const isLocked = !prevStageCompleted;

                return (
                  <TouchableOpacity
                    key={stageNum}
                    activeOpacity={0.7}
                    disabled={isLocked}
                    onPress={() => handleLaunchCampaignStage(stageNum)}
                    style={[
                      styles.stageNode,
                      {
                        backgroundColor: isCompleted
                          ? colors.surfaceBg
                          : isLocked
                          ? colors.background
                          : colors.cardBg,
                        borderColor: isCompleted
                          ? colors.success
                          : isLocked
                          ? colors.divider
                          : colors.accent,
                        opacity: isLocked ? 0.4 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.stageNumText, { color: colors.textPrimary }]}>
                      {stageNum}
                    </Text>

                    {/* Stars Earned */}
                    <View style={styles.nodeStarsRow}>
                      {[1, 2, 3].map((star) => (
                        <Text
                          key={star}
                          style={{
                            fontSize: 10,
                            opacity: star <= stars ? 1 : 0.25,
                          }}
                        >
                          ⭐
                        </Text>
                      ))}
                    </View>

                    {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
                    {isCompleted && stageData.bestTimeSeconds !== null && (
                      <Text style={[styles.bestTimeText, { color: colors.textMuted }]}>
                        {formatTime(stageData.bestTimeSeconds)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Stage 11: SECRET BONUS STAGE NODE */}
            {(() => {
              const allTenDone = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every(
                (s) => stages[`${selectedTier}_${s}`]?.completed,
              );
              const isBonusUnlocked = bonusStagesUnlocked[selectedTier];

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={!allTenDone}
                  onPress={handleLaunchBonusStage}
                  style={[
                    styles.bonusStageCard,
                    {
                      backgroundColor: isBonusUnlocked
                        ? colors.surfaceBg
                        : colors.cardBg,
                      borderColor: colors.gold,
                      opacity: allTenDone ? 1 : 0.45,
                    },
                  ]}
                >
                  <Text style={styles.bonusEmoji}>🌟</Text>
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={[styles.bonusTitle, { color: colors.gold }]}>
                      BONUS BOSS STAGE
                    </Text>
                    <Text style={[styles.bonusDesc, { color: colors.textSecondary }]}>
                      {isBonusUnlocked
                        ? 'Stage Unlocked! Tap to Play.'
                        : allTenDone
                        ? 'Unlocked by 10-stage completion! Tap to reveal.'
                        : 'Finish Stages 1-10 to unlock.'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.bonusActionPill,
                      { backgroundColor: isBonusUnlocked ? colors.gold : colors.surfaceBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bonusActionText,
                        { color: isBonusUnlocked ? '#0F172A' : colors.gold },
                      ]}
                    >
                      {isBonusUnlocked ? 'Play →' : '📺 Unlock'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })()}
          </View>
        ) : (
          /* FREE PLAY MODE VIEW */
          <View style={styles.freePlayList}>
            {CAMPAIGN_TIERS.map((tier) => {
              const config = SUDOKU_TIER_CONFIG[tier];
              const tierStat = stats[tier];

              return (
                <TouchableOpacity
                  key={tier}
                  activeOpacity={0.8}
                  onPress={() => handleLaunchFreePlay(tier)}
                  style={[styles.freePlayCard, { backgroundColor: colors.cardBg, borderColor: colors.divider }]}
                >
                  <View style={styles.freePlayHeader}>
                    <View style={styles.freePlayLeft}>
                      <Text style={styles.freePlayEmoji}>
                        {tier === 'noob'
                          ? '🌱'
                          : tier === 'grinder'
                          ? '🎯'
                          : tier === 'nerd'
                          ? '🌌'
                          : tier === 'pro'
                          ? '😈'
                          : '🐐'}
                      </Text>
                      <View>
                        <Text style={[styles.freePlayTitle, { color: colors.textPrimary }]}>
                          {config.name}
                        </Text>
                        <Text style={[styles.freePlayTag, { color: colors.accent }]}>
                          Badge: {config.badgeTitle}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.freePlayBadge, { backgroundColor: colors.surfaceBg }]}>
                      <Text style={[styles.freePlayTime, { color: colors.textSecondary }]}>
                        ⏱️ {Math.floor(config.baseTimerSeconds / 60)} min
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.freePlayDivider, { backgroundColor: colors.divider }]} />

                  <View style={styles.freePlayFooter}>
                    <Text style={[styles.freePlayStats, { color: colors.textMuted }]}>
                      Wins: {tierStat?.gamesWon || 0} • Best:{' '}
                      {tierStat?.bestTimeSeconds ? formatTime(tierStat.bestTimeSeconds) : '--:--'}
                    </Text>

                    <View style={[styles.playBtnSmall, { backgroundColor: colors.accent }]}>
                      <Text style={styles.playBtnText}>Quick Play →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom AdMob Banner */}
      <AdBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  tutorialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  tutorialEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  tutorialTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  tutorialSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tutorialArrow: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 8,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    elevation: 3,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  tierScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  tierPillEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  tierPillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  tierSummaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  tierSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  tierTimerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tierTimerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stageNode: {
    width: '18%',
    aspectRatio: 0.9,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  stageNumText: {
    fontSize: 16,
    fontWeight: '900',
  },
  nodeStarsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  lockIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 10,
  },
  bestTimeText: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  bonusStageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    marginTop: 6,
    marginBottom: 20,
    elevation: 4,
  },
  bonusEmoji: {
    fontSize: 32,
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bonusDesc: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  bonusActionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bonusActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  freePlayList: {
    marginTop: 4,
  },
  freePlayCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  freePlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freePlayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freePlayEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  freePlayTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  freePlayTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  freePlayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  freePlayTime: {
    fontSize: 12,
    fontWeight: '700',
  },
  freePlayDivider: {
    height: 1,
    marginVertical: 12,
  },
  freePlayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freePlayStats: {
    fontSize: 12,
    fontWeight: '600',
  },
  playBtnSmall: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
