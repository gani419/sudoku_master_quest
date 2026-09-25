import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { useThemeStore } from '../../store/useThemeStore';

export const PraiseToast: React.FC = () => {
  const colors = useThemeStore((s) => s.colors);
  const praiseToast = useGameStore((s) => s.praiseToast);
  const dismiss = useGameStore((s) => s.dismissPraiseToast);

  useEffect(() => {
    if (praiseToast) {
      const timer = setTimeout(() => {
        dismiss();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [praiseToast, dismiss]);

  if (!praiseToast) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.accent,
            shadowColor: colors.accent,
          },
        ]}
      >
        <Text style={styles.emoji}>{praiseToast.emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {praiseToast.text}
          </Text>
          {praiseToast.subtext && (
            <Text style={[styles.subtext, { color: colors.textSecondary }]}>
              {praiseToast.subtext}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 65,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1.5,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  subtext: {
    fontSize: 11,
    fontWeight: '600',
  },
});
