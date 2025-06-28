import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { themes } from "@/theme/themes";
import { useTheme } from "@/theme/ThemeContext";

export default function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <View style={styles.container}>
      {themes.map((t) => (
        <Pressable
          key={t.name}
          onPress={() => setTheme(t)}
          style={[
            styles.button,
            {
              backgroundColor: t.colors.primary,
              borderColor: theme.name === t.name ? "white" : "transparent",
            },
          ]}
        >
          <Text style={styles.text}>{t.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    margin: 5,
  },
  text: {
    color: "#25292e",
    fontWeight: "bold",
    fontFamily: "Futura",
  },
});