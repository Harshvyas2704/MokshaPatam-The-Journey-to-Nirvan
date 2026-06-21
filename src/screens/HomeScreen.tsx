/**
 * HomeScreen — placeholder.
 *
 * Phase 1 placeholder only. No board, animations, or game logic. Exists so the
 * navigation layer has a real entry screen to render and review.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROUTES } from '@/navigation/routes';
import type { RootStackScreenProps } from '@/types';
import { colors, spacing, typography, radius } from '@/constants';

const HomeScreen: React.FC<RootStackScreenProps<'Home'>> = ({ navigation }) => {
  const onBegin = useCallback(() => {
    navigation.navigate(ROUTES.Instructions);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mokshapat</Text>
      <Text style={styles.subtitle}>Journey to Nirvan</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onBegin}
        accessibilityRole="button"
        accessibilityLabel="Begin the journey">
        <Text style={styles.buttonLabel}>Begin the Journey</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    color: colors.gold,
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.primary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.maroon,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.copper,
  },
  buttonLabel: {
    color: colors.ivory,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.primary,
  },
});

export default HomeScreen;
