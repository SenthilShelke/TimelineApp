import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Home: undefined;
  Edit: { title: string; events: any[] };
};

type NavigationProp = StackNavigationProp<RootStackParamList, "Edit">;
type Props = {
  title: string;
  events: any[];
};

export default function TimelineView({ title, events }: Props) {
  const scaleValue = useSharedValue(1);
  const navigation = useNavigation<NavigationProp>();

  const handleEdit = () => {
    navigation.navigate("Edit", { title, events });
  };

  const animateButton = () => {
    scaleValue.value = withTiming(0.9, { duration: 100 }, () => {
      scaleValue.value = withTiming(1, { duration: 100 });
    });
  };

  return (
    <View style={styles.timelineContainer}>
      <Pressable onPress={handleEdit} style={styles.timelineButton}>
        <Text style={styles.timelineText}>{title}</Text>
      </Pressable>
      <Pressable onPress={handleEdit} style={styles.editButton}>
        <Ionicons name="pencil" size={20} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineContainer: { flexDirection: "row", alignItems: "center", margin: 10 },
  timelineButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
  },
  editButton: { 
    marginLeft: 10, 
    padding: 10 
  },
  timelineText: { 
    color: "magenta", 
    fontSize: 20 
  },
});
