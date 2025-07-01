import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import TimelineButton from "../components/TimelineButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@/theme/ThemeContext";
import { ColorTheme } from "@/theme/themes";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase"; 

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
    goBackButtonWrapper: {
      position: "absolute",
      top: 60,
      left: 10,
    },
    goBackButton: {
      marginTop: 4,
      padding: 7.5,
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    headerText: {
        fontSize: 25,
        color: colors.primary,
        marginBottom: 20,
        fontFamily: "Futura",
    },
    divider: {
        height: 2,
        backgroundColor: "grey",
        marginVertical: 20,
        width: "90%",
        alignSelf: "center",
        borderRadius: 1,
    },
    
  });


 


export default function SettingsScreen({
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
  const backScale = useSharedValue(1);

 const handleBackButton = () => {
      backScale.value = withTiming(0.9, { duration: 100 }, () => {
        backScale.value = withTiming(1, { duration: 100 });
      });
      navigation.goBack();
    };

    const handleSendFeedback = () => {
        const subject = encodeURIComponent("App Feedback");
        const body = encodeURIComponent("Hi, here's some feedback: ");
        const email = `mailto:senthil.shelke@gmail.com?subject=${subject}&body=${body}`;

        Linking.openURL(email).catch((err) =>
            console.error("Failed to open email app:", err)
        );
    };

    const handleLogout = async () => {
      try {
        await signOut(auth);
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Try again.");
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Pressable
                onPress={handleBackButton}
                style={styles.goBackButtonWrapper}
              >
                <Animated.View
                  style={[
                    styles.goBackButton,
                    { transform: [{ scale: backScale }] },
                  ]}
                >
                  <Ionicons name="arrow-back-circle" size={30} color="#25292e" />
                </Animated.View>
              </Pressable>
              <View style={styles.divider} />
              <Text style={styles.headerText}>Theme</Text>
              <ThemeSwitcher />
             
              <View style={styles.divider} />
              <Text style={styles.headerText}>Feedback</Text>
                <Pressable onPress={handleSendFeedback}>
                <Text
                    style={{
                    color: colors.primary,
                    fontFamily: "Futura",
                    textDecorationLine: "underline",
                    }}
                >
                    Send feedback via email
                </Text>
                </Pressable>
                 <View style={styles.divider} />
                 
              <Text style={styles.headerText}>App Info</Text>
              <Text style={{ color: colors.text, fontFamily: "Futura", textAlign: "center" }}>
              Version 1.0.0{"\n"}Created by Senthil Shelke
              </Text>
              <View style={styles.divider} />
              <Text style={styles.headerText}>Account</Text>
              <Pressable onPress={handleLogout}>
                <Text
                  style={{
                    color: "red",
                    fontFamily: "Futura",
                    fontSize: 16,
                    textDecorationLine: "underline",
                    marginBottom: 30,
                  }}
                >
                  Log out
                </Text>
              </Pressable>

    </View>
  );
}