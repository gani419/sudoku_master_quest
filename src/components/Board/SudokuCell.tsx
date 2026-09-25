import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CellState } from '../../types/game';
import { useThemeStore } from '../../store/useThemeStore';

interface SudokuCellProps {
  cell: CellState;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  size: number;
  onPress: () => void;
}

const arePropsEqual = (prev: SudokuCellProps, next: SudokuCellProps) => {
  return (
    prev.cell.value === next.cell.value &&
    prev.cell.isError === next.cell.isError &&
    prev.isSelected === next.isSelected &&
    prev.isHighlighted === next.isHighlighted &&
    prev.isSameNumber === next.isSameNumber &&
    prev.size === next.size &&
    prev.cell.notes.length === next.cell.notes.length &&
    prev.cell.notes.every((n, i) => n === next.cell.notes[i])
  );
};

export const SudokuCell = React.memo<SudokuCellProps>(
  ({ cell, isSelected, isHighlighted, isSameNumber, size, onPress }) => {
    const colors = useThemeStore((s) => s.colors);

    // Compute cell background
    let bgColor = 'transparent';
    if (isSelected) {
      bgColor = colors.cellSelectedBg;
    } else if (cell.isError) {
      bgColor = colors.cellErrorBg;
    } else if (isSameNumber) {
      bgColor = colors.cellSameNumberBg;
    } else if (isHighlighted) {
      bgColor = colors.cellHighlightBg;
    }

    // Border styling for 3x3 subgrids
    const isBoxRight = cell.col === 2 || cell.col === 5;
    const isBoxBottom = cell.row === 2 || cell.row === 5;

    const textColor = cell.isError
      ? colors.cellError
      : cell.isInitial
      ? colors.cellInitial
      : colors.cellInput;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.cell,
          {
            width: size,
            height: size,
            backgroundColor: bgColor,
            borderColor: colors.gridBorderInner,
            borderRightWidth: isBoxRight ? 2.5 : 1,
            borderBottomWidth: isBoxBottom ? 2.5 : 1,
            borderRightColor: isBoxRight ? colors.gridBorderOuter : colors.gridBorderInner,
            borderBottomColor: isBoxBottom ? colors.gridBorderOuter : colors.gridBorderInner,
          },
        ]}
      >
        {cell.value > 0 ? (
          <Text
            style={[
              styles.cellText,
              {
                color: textColor,
                fontSize: size * 0.52,
                fontWeight: cell.isInitial ? '800' : '600',
              },
            ]}
          >
            {cell.value}
          </Text>
        ) : (
          <View style={styles.notesGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <View key={num} style={styles.noteCell}>
                <Text
                  style={[
                    styles.noteText,
                    {
                      color: colors.textMuted,
                      fontSize: size * 0.22,
                    },
                  ]}
                >
                  {cell.notes.includes(num) ? num : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  },
  arePropsEqual,
);

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
  },
  cellText: {
    textAlign: 'center',
  },
  notesGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noteCell: {
    width: '33.33%',
    height: '33.33%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    fontWeight: '700',
  },
});
