import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { useThemeStore } from '../../store/useThemeStore';
import { SudokuCell } from './SudokuCell';

interface SudokuGridProps {
  maxSize: number;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({ maxSize }) => {
  const colors = useThemeStore((s) => s.colors);
  const board = useGameStore((s) => s.board);
  const selectedIndex = useGameStore((s) => s.selectedCellIndex);
  const relatedIndices = useGameStore((s) => s.relatedIndices);
  const sameNumberIndices = useGameStore((s) => s.sameNumberIndices);
  const selectCell = useGameStore((s) => s.selectCell);

  const cellSize = Math.floor((maxSize - 6) / 9);
  const totalGridSize = cellSize * 9 + 6;

  if (board.length !== 81) return null;

  return (
    <View
      style={[
        styles.container,
        {
          width: totalGridSize,
          height: totalGridSize,
          borderColor: colors.gridBorderOuter,
          backgroundColor: colors.cardBg,
        },
      ]}
    >
      {board.map((cell) => (
        <SudokuCell
          key={cell.index}
          cell={cell}
          size={cellSize}
          isSelected={selectedIndex === cell.index}
          isHighlighted={relatedIndices.has(cell.index)}
          isSameNumber={sameNumberIndices.has(cell.index)}
          onPress={() => selectCell(cell.index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 3,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    alignSelf: 'center',
    overflow: 'hidden',
  },
});
