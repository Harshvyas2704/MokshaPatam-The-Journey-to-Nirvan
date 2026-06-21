/**
 * MedallionView — the sacred हरिहर क्षेत्र (Harihar Kshetra) medallion at the
 * heart of the upper oval ring. Purely presentational: positioned and sized by
 * the layout engine, it sits above the snake/ladder lines (which pass behind
 * it) but below the soul token. It never intercepts board gestures.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants';
import { HARIHAR_KSHETRA } from '@/data';
import type { MedallionBox } from '../types';

interface MedallionViewProps {
  box: MedallionBox;
}

const MedallionViewComponent: React.FC<MedallionViewProps> = ({ box }) => {
  return (
    <View
      style={[
        styles.medallion,
        { left: box.x, top: box.y, width: box.width, height: box.height },
      ]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Text style={styles.sanskrit} numberOfLines={1} adjustsFontSizeToFit>
        {HARIHAR_KSHETRA.sanskrit}
      </Text>
      <Text style={styles.english} numberOfLines={1} adjustsFontSizeToFit>
        {HARIHAR_KSHETRA.english}
      </Text>
      <Text style={styles.mantra} numberOfLines={1} adjustsFontSizeToFit>
        {HARIHAR_KSHETRA.mantra}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  medallion: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.medallionBorder,
    backgroundColor: colors.medallionBg,
  },
  sanskrit: {
    color: colors.medallionText,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.devanagari,
    textAlign: 'center',
  },
  english: {
    color: colors.medallionBorder,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  mantra: {
    color: colors.medallionMuted,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.devanagari,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export const MedallionView = React.memo(MedallionViewComponent);
MedallionView.displayName = 'MedallionView';
