/**
 * InstructionsScreen — the "Game Introduction" shown between the title screen
 * and the game itself. A calm, scrollable reading of the traditional rules and
 * philosophy of Mokshapat. Content is data-driven (see `@/data/instructions`);
 * this screen is a thin, modest renderer.
 */
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROUTES } from '@/navigation/routes';
import type { RootStackScreenProps } from '@/types';
import {
  INSTRUCTION_SECTIONS,
  INSTRUCTIONS_CREDIT,
  INSTRUCTIONS_CTA,
  INSTRUCTIONS_TITLE,
  ladderListings,
  snakeListings,
  type InstructionSection,
  type PathListing,
} from '@/data';
import { colors, radius, spacing, typography } from '@/constants';

/** A single bullet point with a soft leading marker. */
const Bullet: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bulletMark}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

/** One section card: heading, optional prose, and optional titled bullet groups. */
const Section: React.FC<{ section: InstructionSection }> = ({ section }) => (
  <View style={styles.card}>
    <Text style={styles.cardHeading}>{section.heading}</Text>

    {section.paragraphs?.map((paragraph, i) => (
      <Text key={`p-${i}`} style={styles.paragraph}>
        {paragraph}
      </Text>
    ))}

    {section.groups?.map(group => (
      <View key={group.title} style={styles.group}>
        <Text style={styles.groupTitle}>{group.title}</Text>
        {group.points.map((point, i) => (
          <Bullet key={`${group.title}-${i}`} text={point} />
        ))}
      </View>
    ))}
  </View>
);

/** A card listing every snake or ladder as compact "from → to" chips. */
const PathSection: React.FC<{
  heading: string;
  listings: PathListing[];
  variant: 'ladder' | 'snake';
}> = ({ heading, listings, variant }) => {
  const chipStyle = variant === 'ladder' ? styles.chipLadder : styles.chipSnake;
  const arrow = variant === 'ladder' ? '↑' : '↓';
  return (
    <View style={styles.card}>
      <Text style={styles.cardHeading}>{`${heading}  (${listings.length})`}</Text>
      <View style={styles.chipWrap}>
        {listings.map(({ id, from, to }) => (
          <View key={id} style={[styles.chip, chipStyle]}>
            <Text style={styles.chipText}>{`${from} ${arrow} ${to}`}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const InstructionsScreen: React.FC<RootStackScreenProps<'Instructions'>> = ({
  navigation,
}) => {
  const onStart = useCallback(() => {
    navigation.navigate(ROUTES.Game);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{INSTRUCTIONS_TITLE.eyebrow}</Text>
        <Text style={styles.title}>{INSTRUCTIONS_TITLE.title}</Text>
        <View style={styles.divider} />

        {/* The first section's heading repeats the title, so skip it. */}
        {INSTRUCTION_SECTIONS.map((section, i) =>
          i === 0 ? (
            <View key={section.heading} style={styles.card}>
              {section.paragraphs?.map((paragraph, j) => (
                <Text key={`intro-${j}`} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ) : (
            <Section key={section.heading} section={section} />
          ),
        )}

        <PathSection
          heading="🪜 Ladders"
          listings={ladderListings}
          variant="ladder"
        />
        <PathSection
          heading="🐍 Snakes"
          listings={snakeListings}
          variant="snake"
        />

        <TouchableOpacity
          style={styles.cta}
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel="Start the game">
          <Text style={styles.ctaLabel}>{INSTRUCTIONS_CTA}</Text>
        </TouchableOpacity>

        <Text style={styles.credit}>{INSTRUCTIONS_CREDIT}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  eyebrow: {
    color: colors.copper,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: typography.fontFamily.primary,
  },
  title: {
    color: colors.gold,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.primary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeading: {
    color: colors.saffron,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing.sm,
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing.sm,
  },
  group: {
    marginTop: spacing.md,
  },
  groupTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  bulletMark: {
    color: colors.copper,
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginRight: spacing.sm,
  },
  bulletText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    fontFamily: typography.fontFamily.primary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
  },
  chipLadder: {
    borderColor: colors.ladder,
  },
  chipSnake: {
    borderColor: colors.snake,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
  },
  cta: {
    alignSelf: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.maroon,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.copper,
  },
  ctaLabel: {
    color: colors.ivory,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
  credit: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontFamily: typography.fontFamily.primary,
  },
});

export default InstructionsScreen;
