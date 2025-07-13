import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import TimelineButton from "../components/TimelineButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";
import { ColorTheme } from "@/theme/themes";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@/firebase"; // <-- IMPORTANT: Also import 'db'
import {
  collection,
  query,
  where,
  onSnapshot, // For real-time updates
  doc,
  deleteDoc, // For deleting timelines
  setDoc, // For saving/updating timelines
} from "firebase/firestore"; // <-- ADD FIRESTORE IMPORTS


// When saving data
// await AsyncStorage.setItem(storageKey, JSON.stringify(timelines));

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


  const handleDeleteTimeline = async (id: string) => { // Make async to delete from Firestore
    try {
      const user = auth.currentUser;
      if (user) {
        // Delete from Firestore
        await deleteDoc(doc(db, "users", user.uid, "timelines", id));
        // Update local state (Firestore listener will also handle this)
        setTimelines((prevTimelines) =>
          prevTimelines.filter((timeline) => timeline.id !== id)
        );
      } else {
        console.warn("No user logged in to delete timeline.");
      }
    } catch (e) {
      console.error("Error deleting timeline:", e);
    }
  };



  

  useEffect(() => {
    let unsubscribe: () => void; // Variable to hold the unsubscribe function

    const setupFirestoreListener = () => {
      const user = auth.currentUser;
      if (user) {
        // Construct a query to get timelines specific to this user
        // Data will be structured as: /users/{uid}/timelines/{timelineId}
        const userTimelinesCollectionRef = collection(db, "users", user.uid, "timelines");
        const q = query(userTimelinesCollectionRef); // You can add orderBy, limit etc. here

        // Set up real-time listener
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const loadedTimelines: { id: string; title: string; events: any[] }[] = [];
          querySnapshot.forEach((doc) => {
            // Include the document ID as the timeline's ID
            loadedTimelines.push({ id: doc.id, ...doc.data() as any });
          });
          setTimelines(loadedTimelines);
        }, (error) => {
          console.error("Error listening to timelines:", error);
        });
      } else {
        // No user logged in, clear timelines and ensure no listener is active
        setTimelines([]);
        // If there was a previous listener, unsubscribe it
        if (unsubscribe) {
          unsubscribe();
        }
      }
    };

    // Listen for changes in authentication state
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User logged in, set up Firestore listener
        setupFirestoreListener();
      } else {
        // User logged out, clear timelines and unsubscribe from Firestore
        setTimelines([]);
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = undefined as any; // Clear the variable
        }
      }
    });

    // Cleanup function when component unmounts
    return () => {
      authUnsubscribe(); // Unsubscribe from auth state changes
      if (unsubscribe) {
        unsubscribe(); // Unsubscribe from Firestore listener
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // This useEffect is now for saving the timeline data to Firestore
  // It will be triggered when route.params?.savedTimeline is set from EditScreen


  // Your existing useEffect for `route.params?.cleared` remains the same if needed for local clearing,
  // but if you clear from Firestore, the listener will update the state.
  useEffect(() => {
    if (route.params?.cleared) {
      // You might want to delete ALL user timelines from Firestore here
      // For now, it just clears local state if `cleared` param is true.
      setTimelines([]); // clear in-memory state
      navigation.setParams({ cleared: false });
    }
  }, [route.params?.cleared, navigation]);

  return (
    <View style={styles.container}>
      {/* ... (Rest of your UI for settings icon, title, etc.) */}
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
              // Use timeline.id directly since Firestore doc.id is unique
              key={timeline.id}
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
        onPress={() => navigation.navigate("Edit")}
        style={styles.add_timeline_button}
      >
        <Text style={styles.new_timeline_text}>New Timeline +</Text>
      </Pressable>
    </View>
  );
}

