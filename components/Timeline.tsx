import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
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
      >
        {sortedEvents.map((event, index) => (
          <View key={index} style={styles.eventWrapper}>
            <EventIcon title={event.title} date={event.date} />
          </View>
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
    alignItems: "center",
  },
  line: {
    width: "100%",
    height: 2,
    backgroundColor: "white",
    position: "absolute",
    top: "50%",
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 70,
    alignItems: "center",
  },
  eventWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },
});
