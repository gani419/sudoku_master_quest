import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppHeader } from '../components/Header/AppHeader';
import { SudokuGrid } from '../components/Board/SudokuGrid';
import { Numpad } from '../components/Controls/Numpad';
import { ActionToolbar } from '../components/Controls/ActionToolbar';
import { PraiseToast } from '../components/Modals/PraiseToast';
import { OvertimeModal } from '../components/Modals/OvertimeModal';
import { VictoryModal } from '../components/Modals/VictoryModal';
import { AdBanner } from '../components/Ads/AdBanner';
import { useGameStore } from '../store/useGameStore';
import { useThemeStore } from '../store/useThemeStore';

interface GameScreenProps {
  onBack: () => void;
  onOpenProfile: () => void;
  onNextStage: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  onBack,
  onOpenProfile,
  onNextStage,
}) => {
  const { width, height } = useWindowDimensions();
  const colors = useThemeStore((s) => s.colors);
  const status = useGameStore((s) => s.status);

  const isLandscape = width > height;

  // Compute maximum grid size to stay square without overflowing
  const maxGridSize = isLandscape
    ? Math.min(height - 110, width * 0.55)
    : Math.min(width - 24, height * 0.52);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header with Timer and Profile */}
      <AppHeader onBack={onBack} onOpenProfile={onOpenProfile} isGameScreen />

      {/* Floating Positive Reinforcement Toast */}
      <PraiseToast />

      {/* Main Play Area (Adaptive: Side-by-Side on Tablet/Chromebook Landscape, Stacked on Mobile) */}
      <View style={[styles.mainContent, isLandscape && styles.landscapeRow]}>
        {/* Left / Top: 9x9 Sudoku Board */}
        <View style={[styles.gridContainer, isLandscape && styles.landscapeGrid]}>
          <SudokuGrid maxSize={maxGridSize} />
        </View>

        {/* Right / Bottom: Action Toolbar & 1-9 Numpad */}
        <View style={[styles.controlsContainer, isLandscape && styles.landscapeControls]}>
          <ActionToolbar />
          <Numpad />
        </View>
      </View>

      {/* Sticky Bottom AdMob Banner */}
      <AdBanner />

      {/* Overtime Rewarded Video Ad Modal */}
      <OvertimeModal
        visible={status === 'overtime_prompt'}
        onExitToMenu={onBack}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        visible={status === 'victory'}
        onNextStage={onNextStage}
        onExitToMenu={onBack}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  landscapeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  landscapeGrid: {
    flex: 1.2,
  },
  controlsContainer: {
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
    paddingBottom: 6,
  },
  landscapeControls: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
});
