import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { ThemeProvider } from "@/theme/ThemeContext";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false, // This hides the header for the index screen
          }}
        />
        {/* <Stack.Screen
          name="about"
          options={{ title: "About" }}
        /> */}
        <Stack.Screen
          name="+not-found"
          options={{ title: "Not Found" }}
        />
      </Stack>
    </ThemeProvider>
  );
}