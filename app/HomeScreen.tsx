import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import TimelineView from "../components/TimelineView";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function HomeScreen({
  navigation, route
}: {
  navigation: any; route: any;
}) {
  const scaleValue = useSharedValue(1);
  const [timelines, setTimelines] = useState<{ title: string; events: any[] }[]>([]);

  const animateButton = () => {
    scaleValue.value = withTiming(0.9, { duration: 100 }, () => {
      scaleValue.value = withTiming(1, { duration: 100 });
    });
    navigation.navigate("Edit");
  };

  useEffect(() => {
    if (route.params?.savedTimeline) {
      setTimelines((prevTimelines) => {
        const updatedTimelines = [...prevTimelines];
        const index = updatedTimelines.findIndex(t => t.title === route.params.savedTimeline.title);

        if (index !== -1) {
          updatedTimelines[index] = route.params.savedTimeline;
        } else {
          updatedTimelines.push(route.params.savedTimeline);
        }

        return updatedTimelines;
      });

      setTimeout(() => {
        navigation.setParams({ savedTimeline: null });
      }, 100);
    }
  }, [route.params?.savedTimeline]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Timelines</Text>
      <ScrollView scrollEnabled={timelines.length > 0}>
        {timelines.length > 0 ? (
          timelines.map((timeline, index) => (
            <TimelineView key={index} title={timeline.title} events={timeline.events} />
          ))
        ) : (
          <Text style={styles.noTimelinesText}>No timelines yet. Create one!</Text>
        )}
      </ScrollView>
      <Pressable onPress={() => navigation.navigate("Edit")} style={styles.add_timeline_button}>
        <Text style={styles.new_timeline_text}>New Timeline +</Text>
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
  add_timeline_button: {
    borderWidth: 2,
    borderColor: "magenta",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 5,
    backgroundColor: "magenta",
    bottom: 30,
  },
  new_timeline_text: {
    fontFamily: "Futura",
    color: "#1e1e1e",
    fontSize: 20,
  },
  noTimelinesText: {
    color: "grey",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Futura",
  },
});
