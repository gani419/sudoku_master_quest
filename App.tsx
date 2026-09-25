import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ProfileModal } from './src/components/Modals/ProfileModal';
import { BonusStageModal } from './src/components/Modals/BonusStageModal';
import { OnboardingModal } from './src/components/Modals/OnboardingModal';
import { useGameStore } from './src/store/useGameStore';
import { useThemeStore } from './src/store/useThemeStore';
import { useProfileStore } from './src/store/useProfileStore';
import { Difficulty, PuzzleData } from './src/types/game';
import { AdService } from './src/services/adService';
import allPuzzles from './src/assets/data/puzzles.json';

export default function App() {
  const colors = useThemeStore((s) => s.colors);
  const themeMode = useThemeStore((s) => s.mode);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const activeDifficulty = useGameStore((s) => s.difficulty);
  const activeStageNumber = useGameStore((s) => s.stageNumber);
  const hasSeenOnboarding = useProfileStore((s) => s.hasSeenOnboarding);

  const [currentScreen, setCurrentScreen] = useState<'home' | 'game'>('home');
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [bonusModalTier, setBonusModalTier] = useState<Difficulty | null>(null);

  // Initialize Ads on mount
  useEffect(() => {
    AdService.initAds();
    if (!hasSeenOnboarding) {
      setOnboardingVisible(true);
    }
  }, [hasSeenOnboarding]);

  const handleStartGame = (puzzle: PuzzleData, isCampaign = true) => {
    startNewGame(puzzle, isCampaign);
    setCurrentScreen('game');
  };

  const handleStartPilotGame = () => {
    setOnboardingVisible(false);
    // Find Stage 1 of Noob
    const pilotPuzzle = (allPuzzles as PuzzleData[]).find(
      (p) => p.difficulty === 'noob' && p.stageNumber === 1,
    );
    if (pilotPuzzle) {
      handleStartGame(pilotPuzzle, true);
    }
  };

  const handleNextStage = () => {
    if (activeStageNumber && activeStageNumber < 10) {
      const nextStageNum = activeStageNumber + 1;
      const nextPuzzle = (allPuzzles as PuzzleData[]).find(
        (p) => p.difficulty === activeDifficulty && p.stageNumber === nextStageNum,
      );
      if (nextPuzzle) {
        startNewGame(nextPuzzle, true);
        return;
      }
    }
    // Return to campaign roadmap if completed or stage 10
    setCurrentScreen('home');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
      />

      {currentScreen === 'home' ? (
        <HomeScreen
          onStartGame={handleStartGame}
          onOpenProfile={() => setProfileModalVisible(true)}
          onOpenBonusStagePrompt={(tier) => setBonusModalTier(tier)}
          onOpenTutorial={() => setOnboardingVisible(true)}
        />
      ) : (
        <GameScreen
          onBack={() => setCurrentScreen('home')}
          onOpenProfile={() => setProfileModalVisible(true)}
          onNextStage={handleNextStage}
        />
      )}

      {/* Gamer Profile & Analytics Hub */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* Bonus Stage Unlock Prompt */}
      {bonusModalTier && (
        <BonusStageModal
          visible={!!bonusModalTier}
          tier={bonusModalTier}
          onClose={() => setBonusModalTier(null)}
          onUnlockedAndPlay={() => {
            const tier = bonusModalTier;
            setBonusModalTier(null);
            const bonusPuzzle = (allPuzzles as PuzzleData[]).find(
              (p) => p.difficulty === tier && p.isBonusStage,
            );
            if (bonusPuzzle) {
              handleStartGame(bonusPuzzle, true);
            }
          }}
        />
      )}

      {/* Pilot Briefing / First-time Tutorial */}
      <OnboardingModal
        visible={onboardingVisible}
        onStartPilotGame={handleStartPilotGame}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
