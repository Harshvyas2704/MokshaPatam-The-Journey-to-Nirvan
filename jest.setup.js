/* eslint-env jest */

// Gesture Handler's own jest mocks (mocks the native module + components).
require('react-native-gesture-handler/jestSetup');

// Reanimated 4 sits on top of react-native-worklets, whose native module can't
// load under Node. Mock worklets first so Reanimated's import chain picks up the
// worklets test mock, then mock Reanimated itself (animated components -> no-ops).
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock'),
);
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // The mock omits useReducedMotion; default it to "off" for tests.
  Reanimated.useReducedMotion = () => false;
  return Reanimated;
});

// Use safe-area-context's official jest mock so the safe-area contexts stay
// intact (React Navigation reads them) while rendering synchronously in tests.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
