import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { useThemeStore } from '../../store/useThemeStore';

export const Numpad: React.FC = () => {
  const colors = useThemeStore((s) => s.colors);
  const remainingCounts = useGameStore((s) => s.remainingCounts);
  const inputNumber = useGameStore((s) => s.inputNumber);
  const status = useGameStore((s) => s.status);

  const isInteractive = status === 'playing';

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
        const remaining = remainingCounts[num] ?? 9;
        const isCompleted = remaining === 0;

        return (
          <TouchableOpacity
            key={num}
            activeOpacity={0.6}
            disabled={!isInteractive || isCompleted}
            onPress={() => inputNumber(num)}
            style={[
              styles.button,
              {
                backgroundColor: isCompleted ? colors.surfaceBg : colors.numpadBg,
                borderColor: colors.numpadBorder,
                opacity: isCompleted ? 0.35 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.numberText,
                {
                  color: isCompleted ? colors.textMuted : colors.numpadText,
                },
              ]}
            >
              {num}
            </Text>
            <Text
              style={[
                styles.subtext,
                {
                  color: isCompleted ? colors.textMuted : colors.accent,
                },
              ]}
            >
              {isCompleted ? '✓' : remaining}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
    marginVertical: 10,
  },
  button: {
    flex: 1,
    height: 58,
    marginHorizontal: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  numberText: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtext: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: -2,
  },
});
