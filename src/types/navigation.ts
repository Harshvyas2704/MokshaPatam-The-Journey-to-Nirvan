/**
 * Navigation domain types (React Navigation — native stack).
 *
 * `RootStackParamList` is the single source of truth for routes and their
 * params. `undefined` means the route takes no params. The global
 * augmentation makes the bare `useNavigation()` hook strongly typed app-wide.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Game: undefined;
};

/** Convenience: the set of route names as a union. */
export type RouteName = keyof RootStackParamList;

/** Screen-prop helper, e.g. `RootStackScreenProps<'Game'>`. */
export type RootStackScreenProps<T extends RouteName> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
