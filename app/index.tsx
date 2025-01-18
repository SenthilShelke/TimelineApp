import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./HomeScreen";
import EditScreen from "./EditScreen";

const Stack = createStackNavigator();

export default function Index() {
  return (
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Edit" component={EditScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
  );
}