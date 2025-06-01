import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Feather, Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  Home: undefined;
  Edit: {
    id: string;
    title: string;
    events: {
      id: string;
      title: string;
      date: string;
      description: string;
      images: string[];
    }[];
  };
};

type Props = {
  id: string;
  title: string;
  events: {
    id: string;
    title: string;
    date: string;
    description: string;
    images: string[];
  }[];
  onDelete: (id: string) => void;
};

export default function TimelineView({ id, title, events, onDelete }: Props) {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "Home">>();

  const handleEdit = () => {
    navigation.navigate("Edit", { id, title, events });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Timeline",
      "Are you sure you want to delete this timeline?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(id) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.view_timeline_button}>
      <Text style={styles.view_timeline_text}>{title}</Text>
      <View style={styles.buttonRow}>
        <Pressable onPress={handleEdit} style={styles.iconContainer}>
          <Feather name="edit" size={24} color="magenta" />
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.iconContainer}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  view_timeline_button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "magenta",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#1e1e1e",
    margin: 10,
    width: 350,
  },
  view_timeline_text: {
    color: "magenta",
    fontSize: 20,
    fontFamily: "Futura",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    padding: 6,
    marginLeft: 10,
  },
});
