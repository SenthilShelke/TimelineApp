import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { ColorTheme } from "@/theme/themes";

const getStyles = (colors: ColorTheme["colors"]) =>
  StyleSheet.create({
    view_timeline_button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: colors.card,
      margin: 10,
      width: 350,
    },
    view_timeline_text: {
      color: colors.primary,
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
    deleteIcon: {
      color: colors.primary,

    }
  });

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
  View: {
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

export default function TimelineButton({ id, title, events, onDelete }: Props) {
  const { theme } = useTheme();
      const colors = theme.colors;
      const styles = getStyles(colors);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
    <Pressable onPress={() => {
    navigation.navigate("View", { id, title, events });
  }} style={styles.view_timeline_button}>
      <Text style={styles.view_timeline_text}>{title}</Text>
      <View style={styles.buttonRow}>
        <Pressable onPress={handleEdit} style={styles.iconContainer}>
          <Feather name="edit" size={24} style={styles.deleteIcon} />
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.iconContainer}>
          <Ionicons name="trash-outline" size={24} style={styles.deleteIcon} />
        </Pressable>
      </View>
    </Pressable>
  );
}

