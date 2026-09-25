import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { useThemeStore } from '../../store/useThemeStore';

export const ActionToolbar: React.FC = () => {
  const colors = useThemeStore((s) => s.colors);
  const isNotesMode = useGameStore((s) => s.isNotesMode);
  const undo = useGameStore((s) => s.undo);
  const eraseCell = useGameStore((s) => s.eraseCell);
  const toggleNoteMode = useGameStore((s) => s.toggleNoteMode);
  const useSmartHint = useGameStore((s) => s.useSmartHint);
  const history = useGameStore((s) => s.history);
  const maxMistakesAllowed = useGameStore((s) => s.maxMistakesAllowed);
  const toggleChillMode = useGameStore((s) => s.toggleChillMode);

  const canUndo = history.length > 0;
  const isChill = maxMistakesAllowed === Infinity;

  return (
    <View style={styles.container}>
      {/* Undo Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!canUndo}
        onPress={undo}
        style={[
          styles.actionBtn,
          {
            backgroundColor: colors.surfaceBg,
            borderColor: colors.divider,
            opacity: canUndo ? 1 : 0.4,
          },
        ]}
      >
        <Text style={styles.iconText}>↩️</Text>
        <Text style={[styles.btnLabel, { color: colors.textSecondary }]}>Undo</Text>
      </TouchableOpacity>

      {/* Erase Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={eraseCell}
        style={[
          styles.actionBtn,
          {
            backgroundColor: colors.surfaceBg,
            borderColor: colors.divider,
          },
        ]}
      >
        <Text style={styles.iconText}>🧹</Text>
        <Text style={[styles.btnLabel, { color: colors.textSecondary }]}>Erase</Text>
      </TouchableOpacity>

      {/* Notes / Pencil Toggle */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleNoteMode}
        style={[
          styles.actionBtn,
          {
            backgroundColor: isNotesMode ? colors.accent : colors.surfaceBg,
            borderColor: isNotesMode ? colors.accent : colors.divider,
          },
        ]}
      >
        <View style={styles.badgeContainer}>
          <Text style={styles.iconText}>✏️</Text>
          <View
            style={[
              styles.pillBadge,
              { backgroundColor: isNotesMode ? '#FFFFFF' : colors.textMuted },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isNotesMode ? colors.accent : '#FFFFFF' },
              ]}
            >
              {isNotesMode ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.btnLabel,
            { color: isNotesMode ? '#FFFFFF' : colors.textSecondary, fontWeight: '700' },
          ]}
        >
          Notes
        </Text>
      </TouchableOpacity>

      {/* Smart Hint Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={useSmartHint}
        style={[
          styles.actionBtn,
          {
            backgroundColor: colors.surfaceBg,
            borderColor: colors.divider,
          },
        ]}
      >
        <Text style={styles.iconText}>💡</Text>
        <Text style={[styles.btnLabel, { color: colors.gold, fontWeight: '700' }]}>
          Hint
        </Text>
      </TouchableOpacity>

      {/* Chill Mode Toggle */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleChillMode}
        style={[
          styles.actionBtn,
          {
            backgroundColor: isChill ? colors.secondaryAccent : colors.surfaceBg,
            borderColor: isChill ? colors.secondaryAccent : colors.divider,
          },
        ]}
      >
        <Text style={styles.iconText}>{isChill ? '🧘' : '⚡'}</Text>
        <Text
          style={[
            styles.btnLabel,
            { color: isChill ? '#FFFFFF' : colors.textSecondary },
          ]}
        >
          {isChill ? 'Chill' : 'Strict'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  actionBtn: {
    flex: 1,
    height: 60,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconText: {
    fontSize: 20,
    marginBottom: 2,
  },
  btnLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadge: {
    marginLeft: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
});
