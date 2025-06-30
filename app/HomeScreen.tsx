import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import TimelineButton from "../components/TimelineButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";
import { ColorTheme } from "@/theme/themes";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Ionicons } from "@expo/vector-icons";

const getStyles = (colors: ColorTheme["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.background,
      paddingTop: 60,
    },
    title: {
      textAlign: "center",
      color: colors.primary,
      fontSize: 30,
      fontFamily: "Futura",
      marginBottom: 20,
    },
    add_timeline_button: {
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 30,
      paddingVertical: 5,
      backgroundColor: colors.primary,
      bottom: 30,
    },
    new_timeline_text: {
      fontFamily: "Futura",
      fontSize: 20,
    },
    noTimelinesText: {
      color: 'grey',
      fontSize: 18,
      textAlign: "center",
      marginTop: 20,
      fontFamily: "Futura",
    },
    settingsIconWrapper: {
      position: "absolute",
      top: 60,
      right: 20,
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 5,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    settingsIcon: {
      color: colors.primary,
    }
  });

export default function HomeScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
    const colors = theme.colors;
    const styles = getStyles(colors);
  const scaleValue = useSharedValue(1);
  const [timelines, setTimelines] = useState<
    { id: string; title: string; events: any[] }[]
  >([]);

  const handleDeleteTimeline = (id: string) => {
    setTimelines((prevTimelines) =>
      prevTimelines.filter((timeline) => timeline.id !== id)
    );
  };

  useEffect(() => {
    if (route.params?.savedTimeline) {
      setTimelines((prevTimelines) => {
        const updatedTimelines = [...prevTimelines];
        const index = updatedTimelines.findIndex(
          (t) => t.id === route.params.savedTimeline.id
        );

        if (index !== -1) {
          updatedTimelines[index] = route.params.savedTimeline;
        } else {
          updatedTimelines.push(route.params.savedTimeline);
        }

        return updatedTimelines;
      });

      setTimeout(() => {
        navigation.setParams({ savedTimeline: null });
      }, 100);
    }
  }, [route.params?.savedTimeline]);

  return (
    <View style={styles.container}>
      {/* <ThemeSwitcher></ThemeSwitcher> */}
     <Pressable
  style={styles.settingsIconWrapper}
  onPress={() => {
    navigation.navigate("Settings");
  }}
>
  <Ionicons name="cog" size={30} style={styles.settingsIcon} />
</Pressable>
      <Text style={styles.title}>Your Timelines</Text>
      <ScrollView scrollEnabled={timelines.length > 0}>
        {timelines.length > 0 ? (
          timelines.map((timeline, index) => (
            <TimelineButton
              key={index}
              id={timeline.id}
              title={timeline.title}
              events={timeline.events}
              onDelete={(id) => handleDeleteTimeline(id)}
            />
          ))
        ) : (
          <Text style={styles.noTimelinesText}>
            No timelines yet. Create one!
          </Text>
        )}
      </ScrollView>
      <Pressable
        onPress={() => 
          
          navigation.navigate("Edit")
          
        }
        style={styles.add_timeline_button}
      >
        <Text style={styles.new_timeline_text}>New Timeline +</Text>
      </Pressable>
    </View>
  );
}

