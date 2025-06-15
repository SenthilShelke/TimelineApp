import React, { useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import EventEditor from "./EventEditor";

type Props = {
  id: string;
  title: string;
  date: string;
  description: string;
  images?: string[];
  onUpdateEvent: (updatedEvent: {
    id: string;
    title: string;
    date: string;
    description: string;
    images: string[];
  }) => void;
  onDeleteEvent: 
  () => void;
};

export default function EventIcon({
  id,
  title,
  date,
  description,
  images = [],
  onUpdateEvent,
  onDeleteEvent,
}: Props) {
  const scale = useSharedValue(1);
  const deleteOpacity = useSharedValue(0);
  const deleteScale = useSharedValue(0.9);
  const overlayOpacity = useSharedValue(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const eventDetails = { title, date, description, images };

  const deleteIconStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
    transform: [{ scale: deleteScale.value }],
    position: "absolute",
    top: -30,
    alignSelf: "center",
    zIndex: 100,
  }));

  return (
    <>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        {showDelete && (
          <Animated.View style={deleteIconStyle}>
            <Pressable onPress={onDeleteEvent}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </Pressable>
          </Animated.View>
        )}
        <Pressable
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.dateText}>
            {new Date(eventDetails.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <Text style={styles.titleText}>{eventDetails.title}</Text>
        </Pressable>

        <EventEditor
        onDelete={() => {
    setModalVisible(false);
    onDeleteEvent();
  }}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={(newEvent) => {
            const updatedEvent = {
              id,
              title: newEvent.title,
              date: new Date(newEvent.date).toISOString(),
              description: newEvent.description,
              images: [...newEvent.images],
            };
            onUpdateEvent(updatedEvent);
            setModalVisible(false);
          }}
          initialTitle={eventDetails.title}
          initialDate={new Date(eventDetails.date)}
          initialDescription={eventDetails.description}
          initialImages={eventDetails.images}
        />
      </Animated.View>
    </>
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