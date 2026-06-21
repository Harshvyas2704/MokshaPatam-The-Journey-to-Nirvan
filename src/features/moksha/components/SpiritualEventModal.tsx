/**
 * SpiritualEventModal — presents a snake / ladder / concept / moksha event.
 *
 * Calm, premium presentation: a dimmed backdrop and a single heritage card with
 * a glyph, the vice/virtue (or concept) label, the Sanskrit term + its
 * translation, a teaching message, and the soul's movement (from → to). The
 * player taps "Continue" to resume the journey.
 *
 * Sanskrit renders in the dedicated Devanagari font family (falls back to System
 * until the font asset is linked).
 */
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '@/constants';
import type { SpiritualEvent, SpiritualEventKind } from '../events';
import { EventGlyph } from './EventGlyph';

interface SpiritualEventModalProps {
  event: SpiritualEvent | null;
  onDismiss: () => void;
}

/** Accent colour + continue-label per event kind. */
const ACCENT: Record<SpiritualEventKind, { color: string; action: string }> = {
  snake: { color: colors.saffron, action: 'Continue the journey' },
  ladder: { color: colors.gold, action: 'Continue the journey' },
  moksha: { color: colors.moksha, action: 'Begin anew' },
  concept: { color: colors.copper, action: 'Continue the journey' },
  narak: { color: '#D9806E', action: 'Continue the journey' },
};

const KIND_TITLE: Record<SpiritualEventKind, string> = {
  snake: 'Obstacle',
  ladder: 'Virtue',
  moksha: 'Liberation',
  concept: 'Teaching',
  narak: 'Naraka',
};

const SpiritualEventModalComponent: React.FC<SpiritualEventModalProps> = ({
  event,
  onDismiss,
}) => {
  const visible = event !== null;
  const accent = event ? ACCENT[event.kind] : ACCENT.concept;
  const showJourney = event ? event.from !== event.to : false;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}>
      <Animated.View
        entering={FadeIn.duration(220)}
        style={styles.backdrop}
        accessibilityViewIsModal>
        {event ? (
          <Animated.View
            key={`${event.kind}-${event.from}-${event.to}`}
            entering={FadeInDown.duration(300)}
            style={[styles.card, { borderColor: accent.color }]}>
            <Text style={[styles.kindLabel, { color: accent.color }]}>
              {KIND_TITLE[event.kind]}
            </Text>

            <EventGlyph kind={event.kind} size={72} />

            <Text style={[styles.label, { color: accent.color }]}>
              {event.label}
            </Text>

            {event.sanskrit ? (
              <Text style={styles.sanskrit} accessibilityLabel={event.sanskrit}>
                {event.sanskrit}
              </Text>
            ) : null}

            {event.translation ? (
              <Text style={styles.translation}>{event.translation}</Text>
            ) : null}

            {event.message ? (
              <Text style={styles.message}>{event.message}</Text>
            ) : null}

            {showJourney ? (
              <View style={styles.journey}>
                <Text style={styles.journeyCell}>{event.from}</Text>
                <Text style={[styles.journeyArrow, { color: accent.color }]}>
                  →
                </Text>
                <Text style={styles.journeyCell}>{event.to}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: accent.color }]}
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel={accent.action}>
              <Text style={styles.buttonLabel}>{accent.action}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  kindLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sanskrit: {
    fontSize: typography.fontSize.xxl,
    color: colors.ivory,
    fontFamily: typography.fontFamily.devanagari,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  translation: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.primary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  journey: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  journeyCell: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
    minWidth: 44,
    textAlign: 'center',
  },
  journeyArrow: {
    fontSize: typography.fontSize.lg,
    marginHorizontal: spacing.md,
  },
  button: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  buttonLabel: {
    fontSize: typography.fontSize.md,
    color: colors.background,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
});

export const SpiritualEventModal = React.memo(SpiritualEventModalComponent);
SpiritualEventModal.displayName = 'SpiritualEventModal';
