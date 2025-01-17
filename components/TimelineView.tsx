import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
type Props = {
  title: string;
  onPress?: () => void;
};

export default function TimelineView({ title, onPress }: Props) {
  const scaleValue = useSharedValue(1);

  onPress = () => {
    alert("You pressed a button");
  };

  const animateButton = () => {
    scaleValue.value = withTiming(0.9, { duration: 100 }, () => {
      scaleValue.value = withTiming(1, { duration: 100 });
    });
    onPress();
  };

  return (
    <View>
      <Pressable onPress={animateButton}>
        <Animated.View
          style={[
            styles.view_timeline_button,
            { transform: [{ scale: scaleValue }] },
          ]}
        >
          <Text style={styles.view_timeline_text}>{title}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  view_timeline_button: {
    borderWidth: 2,
    borderColor: "magenta",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: "#25292e",
    margin: 10,
    justifyContent: "center",
    width: 350,
  },
  view_timeline_text: {
    color: "magenta",
    fontSize: 20,
    fontFamily: "Futura",
  },
});
