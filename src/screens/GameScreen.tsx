/**
 * GameScreen
 *
 * Hosts the zoomable board (with the soul token) and the fixed control bar
 * (Phase 5: dice + roll/auto/reset). Only the board zooms/pans; the top bar and
 * controls stay fixed.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoardRenderer } from '@/features/board';
import { GameControls } from '@/features/game';
import type { RootStackScreenProps } from '@/types';
import { colors, radius, spacing, typography } from '@/constants';

const GameScreen: React.FC<RootStackScreenProps<'Game'>> = ({ navigation }) => {
  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Return home">
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Journey to Nirvan</Text>
        <View style={styles.backButtonSpacer} />
      </View>

      <View style={styles.boardArea}>
        <BoardRenderer />
      </View>

      <GameControls />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.copper,
  },
  backButtonSpacer: {
    width: 64,
  },
  backLabel: {
    color: colors.ivory,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
  },
  title: {
    color: colors.gold,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
  boardArea: {
    flex: 1,
  },
});

export default GameScreen;
