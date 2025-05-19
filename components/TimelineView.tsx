import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";

type RootStackParamList = {
  Home: undefined;
  Edit: { title: string; events: { title: string; date: string; description: string; images: string[] }[] };
};

type Props = {
  title: string;
  events: { title: string; date: string; description: string; images: string[] }[];
};

export default function TimelineView({ title, events }: Props) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Home">>();

  const handleEdit = () => {
    navigation.navigate("Edit", { title, events });
  };

  return (
    <View style={styles.view_timeline_button}>
      <Text style={styles.view_timeline_text}>{title}</Text>
      <Pressable onPress={handleEdit} style={styles.edit_icon_container}>
        <Feather name="edit" size={24} color="magenta" />
      </Pressable>
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
  edit_icon_container: {
    padding: 6,
  },
});