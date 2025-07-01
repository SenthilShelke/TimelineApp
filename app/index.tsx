import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./HomeScreen";
import EditScreen from "./EditScreen";
import ViewTimeline from "./TimelineScreen";
import SettingsScreen from "./SettingsScreen";
import LoginScreen from "./LoginScreen"; // <- you'll create this next
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { auth } from "@/firebase";
import type { User } from "firebase/auth";

const Stack = createStackNavigator();

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    // If logged in and email is verified, allow access
    if (user && user.emailVerified) {
      setUser(user);
    } else {
      setUser(null); // treat unverified users like logged out
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);

  if (loading) return null; 

  return (
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={user ? "Home" : "Login"}>
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Edit" component={EditScreen} />
  <Stack.Screen name="View" component={ViewTimeline} />
  <Stack.Screen name="Settings" component={SettingsScreen} />
</Stack.Navigator>
  );
}