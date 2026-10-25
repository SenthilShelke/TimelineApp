import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./HomeScreen";
import EditScreen from "./EditScreen";
import ViewTimeline from "./TimelineScreen";
import SettingsScreen from "./SettingsScreen";
import LoginScreen from "./LoginScreen";
import { getCurrentUser } from "@/api/auth";
import type { AuthUser } from "@/api/types";

const Stack = createStackNavigator();

export default function Index() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On launch, check for a stored token and validate it against the API.
    (async () => {
      try {
        const current = await getCurrentUser();
        setUser(current);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={user ? "Home" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Edit" component={EditScreen} />
        <Stack.Screen name="View" component={ViewTimeline} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}