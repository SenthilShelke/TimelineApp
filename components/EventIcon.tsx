import React, { useRef, useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import EventEditor from "./EventEditor";

type Props = {
  title: string;
  date: string;
  description: string;
  images?: string[]
};

export default function EventIcon({ title, date, description, images=[]}: Props) {

  const [modalVisible, setModalVisible] = useState(false);
  const [eventDetails, setEventDetails] = useState<{ title: string; date: string; description: string; images: string[] }>({
    title: title || "", 
    date: date || "", 
    description: description || "", 
    images: images
  });

  const handleEditEvent = () => {
      setModalVisible(true);
    };
  
    const handleSaveEvent = (newEvent: { title: string; date: string; description: string; images: string[] }) => {
      setEventDetails({
        ...newEvent,
        date: new Date(newEvent.date).toISOString(),
      });
      setModalVisible(false);
    };

  return (
    <View style={styles.card}>
      <Pressable onPress={handleEditEvent}>
      <Text style={styles.dateText}>{new Date(eventDetails.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',  
    day: 'numeric',
  })}</Text>
      <Text style={styles.titleText}>{eventDetails.title}</Text>
      </Pressable>
      <EventEditor
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEvent}
        initialTitle={eventDetails.title}
        initialDate={new Date (eventDetails.date)}
        initialDescription={eventDetails.description}
      />
      
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
