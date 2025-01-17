import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import TimelineView from "../components/TimelineView";

export default function HomeScreen({ navigation }: {navigation: any}) {
    const scaleValue = useSharedValue(1);
    
    const animateButton = () => {
        scaleValue.value = withTiming(0.9, { duration: 100 }, () => {
        scaleValue.value = withTiming(1, { duration: 100 });
        });
        navigation.navigate("Edit");
    };
    
    return (
        <View style={styles.container}>
        <Text style={styles.title}>Your Timelines</Text>
        <TimelineView title="Title 1" />
        <TimelineView title="Title 2" />
        <Pressable
            onPress={animateButton}
            style={styles.add_timeline_button_wrapper}
        >
            <Animated.View
            style={[
                styles.add_timeline_button,
                { transform: [{ scale: scaleValue }] },
            ]}
            >
            <Text style={styles.new_timeline_text}>New Timeline +</Text>
            </Animated.View>
        </Pressable>
        </View>
    );
    }

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          alignItems: "center",
          backgroundColor: "#25292e",
          paddingTop: 60,
        },
        title: {
          textAlign: "center",
          color: "magenta",
          fontSize: 30,
          fontFamily: "Futura",
          marginBottom: 20,
        },
        add_timeline_button_wrapper: {
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          alignItems: "center",
        },
        add_timeline_button: {
          borderWidth: 2,
          borderColor: "magenta",
          borderRadius: 20,
          paddingHorizontal: 30,
          paddingVertical: 5,
          backgroundColor: "magenta",
        },
        new_timeline_text: {
          fontFamily: "Futura",
          color: "#25292e",
          fontSize: 20,
        },
      });