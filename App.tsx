/**
 * Mokshapat – Journey to Nirvan
 * App root.
 *
 * Mounts the gesture root, safe-area provider, status bar, and the React
 * Navigation stack. GestureHandlerRootView must wrap the whole app for the
 * board's pinch/pan gestures (Phase 3) to work.
 */
import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation';
import { colors } from '@/constants';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
