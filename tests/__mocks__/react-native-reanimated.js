// Minimal manual mock for react-native-reanimated under Jest.
// The package's own mock.js (v4.7) crashes during module init
// (`setCSSEventHandler is not available in JSReanimated`), so we provide just the
// APIs the app actually uses: useSharedValue, withTiming, useAnimatedStyle,
// runOnJS, and the default Animated.View (a plain RN View).
const React = require('react');
const { View } = require('react-native');

const AnimatedView = React.forwardRef((props, ref) =>
  React.createElement(View, { ...props, ref })
);

// withTiming returns the target value immediately; callback (if any) fires as finished.
const withTiming = (toValue, _config, callback) => {
  if (typeof callback === 'function') callback(true);
  return toValue;
};

const useSharedValue = (initial) => ({ value: initial });
const useAnimatedStyle = (factory) => {
  try {
    return factory();
  } catch {
    return {};
  }
};
const runOnJS = (fn) => fn;
const withSpring = (toValue) => toValue;
const withDelay = (_delay, value) => value;
const withRepeat = (value) => value;
const useDerivedValue = (factory) => ({ value: factory ? factory() : undefined });
const interpolate = (value) => value;

module.exports = {
  __esModule: true,
  default: {
    View: AnimatedView,
    createAnimatedComponent: (Component) => Component,
  },
  View: AnimatedView,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  useDerivedValue,
  runOnJS,
  interpolate,
  Easing: {
    linear: (t) => t,
    ease: (t) => t,
    inOut: (fn) => fn,
    out: (fn) => fn,
    in: (fn) => fn,
    bezier: () => (t) => t,
  },
};
