import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock necessary native modules that Jest doesn't support
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('expo', () => ({
    ...jest.requireActual('expo'),
    FormData: class MockFormData {
      append = jest.fn();
    },
  }));