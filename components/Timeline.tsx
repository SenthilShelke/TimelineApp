import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import EventIcon from "./EventIcon";

type Props = {
  events: { title: string; date: string }[];
};

export default function Timeline({ events = [] }: Props) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {sortedEvents.map((event, index) => (
          <Pressable key={index} onPressIn={() => {}}>
            <View style={styles.eventWrapper}>
              <EventIcon title={event.title} date={event.date} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 100,
  },
  line: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    minWidth: "100%", 
  },
  eventWrapper: {
    alignItems: "center",
    marginHorizontal: 15,
  },
});