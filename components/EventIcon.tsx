import React, { useRef, useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";

type Props = {
  title: string;
  date: string;
};

export default function EventIcon({ title, date }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.dateText}>{date}</Text>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "magenta",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  titleText: {
    color: "#1e1e1e",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  dateText: {
    color: "grey",
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
});
