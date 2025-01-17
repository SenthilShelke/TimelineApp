import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { Ionicons } from '@expo/vector-icons';

export default function EditScreen({navigation}: {navigation: any}) {
  const scaleValue = useSharedValue(1);
      
      const animateButton = () => {
          scaleValue.value = withTiming(0.9, { duration: 100 }, () => {
          scaleValue.value = withTiming(1, { duration: 100 });
          });
          navigation.goBack();
      };
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Edit screen</Text>
          <Pressable onPress={animateButton} style={styles.goBackButtonWrapper}>
            <Animated.View style={[styles.goBackButton, { transform: [{ scale: scaleValue }] }]}>
              <Ionicons name="arrow-back-circle" size={50} color="#25292e" />
            </Animated.View>
          </Pressable>
        </View>
      );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
  goBackButtonWrapper: {
    position: 'absolute',
    top: 40,
    left: 10,
  },
  goBackButton: {
    padding: 10,
    backgroundColor: "magenta",
    borderRadius: 10,
  },
});
