import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "magenta",
        headerStyle: { backgroundColor: "#25292e" },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#25292e",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Home", tabBarLabel: "Home", headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={30}
            ></Ionicons>
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          headerTitle: "About", tabBarLabel: "About",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                focused
                  ? "information-circle-sharp"
                  : "information-circle-outline"
              }
              color={color}
              size={24}
            ></Ionicons>
          ),
        }}
      />
      <Tabs.Screen name="+not-found" options={{}}></Tabs.Screen>
    </Tabs>
  );
}
