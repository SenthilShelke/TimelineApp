import React, { useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export default function EditScreen({ navigation }: { navigation: any }) {
  const scaleValue = useSharedValue(1);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);

    return () => clearTimeout(focusTimeout);
  }, []);

  const handleBackButton = () => {
    scaleValue.value = withTiming(0.9, { duration: 100 }, () => {
      scaleValue.value = withTiming(1, { duration: 100 });
    });
    navigation.goBack();
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          ref={inputRef}
          placeholder="Title"
          placeholderTextColor={"#aaa"}
        ></TextInput>
        <Pressable
          onPress={handleBackButton}
          style={styles.goBackButtonWrapper}
        >
          <Animated.View
            style={[
              styles.goBackButton,
              { transform: [{ scale: scaleValue }] },
            ]}
          >
            <Ionicons name="arrow-back-circle" size={50} color="#25292e" />
          </Animated.View>
        </Pressable>
        <Pressable
          style={styles.add_event_button_wrapper}
        >
          <Animated.View
            style={[
              styles.add_event_button,
              { transform: [{ scale: scaleValue }] },
            ]}
          >
            <Text style={styles.new_event_text}>Add Event +</Text>
          </Animated.View>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
  goBackButtonWrapper: {
    position: "absolute",
    top: 60,
    left: 10,
  },
  goBackButton: {
    padding: 10,
    backgroundColor: "magenta",
    borderRadius: 10,
  },
  input: {
    position: "absolute",
    top: 60,
    textAlign: "center",
    height: 50,
    width: "50%",
    borderColor: "magenta",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "magenta",
    fontSize: 20,
    backgroundColor: "#1e1e1e",
    fontFamily: "Futura",
  },
  add_event_button_wrapper: {
    position: "absolute",
    bottom: 650,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  add_event_button: {
    borderWidth: 2,
    borderColor: "magenta",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 5,
    backgroundColor: "magenta",
  },
  new_event_text: {
    fontFamily: "Futura",
    color: "#25292e",
    fontSize: 20,
  },
});
