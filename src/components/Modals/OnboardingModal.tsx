import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useProfileStore } from '../../store/useProfileStore';

interface OnboardingModalProps {
  visible: boolean;
  onStartPilotGame: () => void;
}

const TUTORIAL_SLIDES = [
  {
    emoji: '🎯',
    title: 'The 9x9 Golden Rule',
    desc: 'Every row, every column, and each 3x3 box must contain numbers 1 through 9 with ZERO duplicates.',
    tip: 'Pro Tip: Scan for rows with 7 or 8 numbers already filled!',
  },
  {
    emoji: '✏️',
    title: 'Smart Pencil Notes',
    desc: 'Stuck on a tricky cell? Turn on Notes Mode to jot down possible candidates without penalties.',
    tip: 'Candidates auto-erase when the correct number is placed nearby.',
  },
  {
    emoji: '🐐',
    title: 'Beat the Clock & Level Up',
    desc: 'Each level has a countdown timer. Finish stages to unlock gamer badges from Rookie all the way to The GOAT!',
    tip: 'Ran out of time? Watch a quick video to get bonus minutes and protect your streak.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onStartPilotGame,
}) => {
  const colors = useThemeStore((s) => s.colors);
  const setOnboardingCompleted = useProfileStore((s) => s.setOnboardingCompleted);
  const [slideIndex, setSlideIndex] = useState(0);

  const currentSlide = TUTORIAL_SLIDES[slideIndex];
  const isLast = slideIndex === TUTORIAL_SLIDES.length - 1;

  const handleFinish = () => {
    setOnboardingCompleted();
    onStartPilotGame();
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setSlideIndex((prev) => prev + 1);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.accent }]}>
          {/* Header with Skip button */}
          <View style={styles.header}>
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              PILOT BRIEFING • STEP {slideIndex + 1}/3
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleFinish}>
              <Text style={[styles.skipText, { color: colors.textMuted }]}>
                Skip Tutorial
              </Text>
            </TouchableOpacity>
          </View>

          {/* Slide Visual Content */}
          <Text style={styles.emoji}>{currentSlide.emoji}</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {currentSlide.title}
          </Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            {currentSlide.desc}
          </Text>

          {/* Tip Box */}
          <View style={[styles.tipBox, { backgroundColor: colors.surfaceBg, borderColor: colors.divider }]}>
            <Text style={[styles.tipText, { color: colors.accent }]}>
              💡 {currentSlide.tip}
            </Text>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {TUTORIAL_SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === slideIndex ? colors.accent : colors.divider,
                    width: i === slideIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNext}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.primaryBtnText}>
              {isLast ? "Let's Play Pilot Game! →" : 'Next Step →'}
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
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 390,
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
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  tipBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
