import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock necessary native modules that Jest doesn't support
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('expo', () => ({
    ...jest.requireActual('expo'),
    FormData: class MockFormData {
      append = jest.fn();
    },
  }));

// AsyncStorage has no native module under Jest — use the official mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock the API layer so screen tests exercise UI behavior without real network/storage.
jest.mock('@/api/auth', () => ({
  signup: jest.fn().mockResolvedValue({ id: 'u1', email: 'test@test.com', displayName: null, emailVerified: false }),
  login: jest.fn().mockResolvedValue({ id: 'u1', email: 'test@test.com', displayName: null, emailVerified: false }),
  logout: jest.fn().mockResolvedValue(undefined),
  getCurrentUser: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/api/timelines', () => ({
  listTimelines: jest.fn().mockResolvedValue([]),
  getTimeline: jest.fn().mockResolvedValue(null),
  createTimeline: jest.fn().mockResolvedValue({ id: 't1', title: 'x', events: [] }),
  updateTimeline: jest.fn().mockResolvedValue({ id: 't1', title: 'x', events: [] }),
  deleteTimeline: jest.fn().mockResolvedValue(undefined),
}));

// Screens are rendered in isolation (not inside a NavigationContainer), so stub
// the navigation hooks they use. useFocusEffect runs its callback once like an effect.
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const React = require('react');
  return {
    ...actual,
    useFocusEffect: (cb) => React.useEffect(cb, []),
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), reset: jest.fn() }),
  };
});