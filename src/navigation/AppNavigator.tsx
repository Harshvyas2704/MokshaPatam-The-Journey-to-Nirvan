/**
 * AppNavigator — React Navigation native stack.
 *
 * The single place that maps routes to screen components and owns the
 * NavigationContainer. Headers are hidden for an immersive, sacred feel;
 * screens render full-bleed and manage their own chrome. The container theme
 * background uses the app's deep canvas color to avoid white flashes.
 */
import React from 'react';
import {
  DarkTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types';
import { GameScreen, HomeScreen, InstructionsScreen } from '@/screens';
import { colors } from '@/constants';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    primary: colors.gold,
    border: colors.border,
  },
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={ROUTES.Home}
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.Home} component={HomeScreen} />
        <Stack.Screen
          name={ROUTES.Instructions}
          component={InstructionsScreen}
        />
        <Stack.Screen name={ROUTES.Game} component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
