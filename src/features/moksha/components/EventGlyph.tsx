/**
 * EventGlyph — a small circular badge with a typographic mark for an event.
 *
 * Deliberately uses spiritual / geometric glyphs (Om, arrows, a star) rather
 * than emoji or cartoon icons, in keeping with the heritage tone.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/constants';
import type { SpiritualEventKind } from '../events';

interface EventGlyphProps {
  kind: SpiritualEventKind;
  size: number;
}

interface GlyphStyle {
  glyph: string;
  background: string;
  /** Devanagari mark needs the Sanskrit font family. */
  devanagari?: boolean;
}

const GLYPHS: Record<SpiritualEventKind, GlyphStyle> = {
  snake: { glyph: '↓', background: colors.snake },
  ladder: { glyph: '↑', background: colors.ladder },
  moksha: { glyph: 'ॐ', background: colors.moksha, devanagari: true },
  concept: { glyph: '✦', background: colors.surfaceMuted },
};

const EventGlyphComponent: React.FC<EventGlyphProps> = ({ kind, size }) => {
  const { glyph, background, devanagari } = GLYPHS[kind];
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: background,
        },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Text
        style={[
          styles.glyph,
          {
            fontSize: size * (devanagari ? 0.52 : 0.46),
            fontFamily: devanagari
              ? typography.fontFamily.devanagari
              : typography.fontFamily.primary,
          },
        ]}>
        {glyph}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  glyph: {
    color: colors.ivory,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export const EventGlyph = React.memo(EventGlyphComponent);
EventGlyph.displayName = 'EventGlyph';
