import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
import { cleanup } from '@testing-library/react-native';

// RTL 14's auto-cleanup can be unreliable with the async render; unmount
// explicitly after every test so a stale screen never leaks into the next.
afterEach(() => {
  cleanup();
});

// Mock necessary native modules that Jest doesn't support.
// reanimated 4 is mocked via its own jest setup (see jest.config setupFiles),
// which also handles react-native-worklets. No manual jest.mock needed here.

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

// @expo/vector-icons loads fonts from the asset registry, which isn't available
// under Jest. Stub each icon set as a simple component.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const makeIcon = (name) => (props) =>
    React.createElement(Text, props, props.name ? `${name}:${props.name}` : name);
  return new Proxy(
    {},
    { get: (_t, prop) => makeIcon(String(prop)) }
  );
});

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