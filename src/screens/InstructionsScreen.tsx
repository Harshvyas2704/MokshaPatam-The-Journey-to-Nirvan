/**
 * InstructionsScreen — the "Game Introduction" shown between the title screen
 * and the game itself. A calm, scrollable reading of the traditional rules and
 * philosophy of Mokshapat. Content is data-driven (see `@/data/instructions`);
 * this screen is a thin, modest renderer.
 */
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROUTES } from '@/navigation/routes';
import type { PlayerConfig, RootStackScreenProps } from '@/types';
import { useGameStore } from '@/store';
import { Collapsible } from '@/components';
import { PlayerSetupModal } from '@/features/game';
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

/** A single listing row: a number badge plus the square names it connects. */
const PathRow: React.FC<{ listing: PathListing; arrow: string; accent: string }> = ({
  listing,
  arrow,
  accent,
}) => (
  <View style={styles.pathRow}>
    <View style={[styles.pathBadge, { borderColor: accent }]}>
      <Text style={[styles.pathBadgeText, { color: accent }]}>
        {`${listing.from} ${arrow} ${listing.to}`}
      </Text>
    </View>
    <View style={styles.pathTitles}>
      <Text style={styles.pathFromTitle} numberOfLines={2}>
        {listing.fromTitle}
      </Text>
      <Text style={styles.pathToTitle} numberOfLines={2}>
        {`${arrow} ${listing.toTitle}`}
      </Text>
    </View>
  </View>
);

/** A collapsible banner that reveals every snake or ladder, with titles. */
const PathSection: React.FC<{
  title: string;
  listings: PathListing[];
  variant: 'ladder' | 'snake';
}> = ({ title, listings, variant }) => {
  const accent = variant === 'ladder' ? colors.ladder : colors.snake;
  const arrow = variant === 'ladder' ? '↑' : '↓';
  return (
    <Collapsible title={title} badge={String(listings.length)} accent={accent}>
      {listings.map(listing => (
        <PathRow
          key={listing.id}
          listing={listing}
          arrow={arrow}
          accent={accent}
        />
      ))}
    </Collapsible>
  );
};

const InstructionsScreen: React.FC<RootStackScreenProps<'Instructions'>> = ({
  navigation,
}) => {
  const startGame = useGameStore(state => state.startGame);
  const [setupOpen, setSetupOpen] = useState(false);

  const onOpenSetup = useCallback(() => setSetupOpen(true), []);
  const onCloseSetup = useCallback(() => setSetupOpen(false), []);
  const onStart = useCallback(
    (configs: PlayerConfig[]) => {
      startGame(configs);
      setSetupOpen(false);
      navigation.navigate(ROUTES.Game);
    },
    [startGame, navigation],
  );

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
          title="🪜 Ladders"
          listings={ladderListings}
          variant="ladder"
        />
        <PathSection title="🐍 Snakes" listings={snakeListings} variant="snake" />

        <Text style={styles.credit}>{INSTRUCTIONS_CREDIT}</Text>
      </ScrollView>

      {/* Fixed footer — the CTA never scrolls away. */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cta}
          onPress={onOpenSetup}
          accessibilityRole="button"
          accessibilityLabel="Start the game">
          <Text style={styles.ctaLabel}>{INSTRUCTIONS_CTA}</Text>
        </TouchableOpacity>
      </View>

      <PlayerSetupModal
        visible={setupOpen}
        onClose={onCloseSetup}
        onStart={onStart}
      />
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
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pathBadge: {
    minWidth: 78,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: colors.surfaceMuted,
    marginRight: spacing.md,
  },
  pathBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
    textAlign: 'center',
  },
  pathTitles: {
    flex: 1,
  },
  pathFromTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
  },
  pathToTitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.primary,
    marginTop: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cta: {
    alignSelf: 'center',
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
