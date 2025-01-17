// // import React from "react";
// // import { View, Text, StyleSheet, Pressable } from "react-native";
// // import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
// // import { createStaticNavigation } from '@react-navigation/native';
// // import { createNativeStackNavigator } from '@react-navigation/native-stack';
// // import TimelineView from "@/components/TimelineView";
// // // import HomeScreen from "./HomeScreen";
// // // import EditScreen from "./EditScreen";

// // function HomeScreen() {
// //   return (
// //     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
// //       <Text>Home Screen</Text>
// //     </View>
// //   );
// //   // const scaleValue = useSharedValue(1);
      
// //   //     const animateButton = () => {
// //   //         scaleValue.value = withTiming(0.9, { duration: 100 }, () => {
// //   //         scaleValue.value = withTiming(1, { duration: 100 });
// //   //         });
// //   //     };
      
// //   //     return (
// //   //         <View style={styles.container}>
// //   //         <Text style={styles.title}>Your Timelines</Text>
// //   //         <TimelineView title="Title 1" />
// //   //         <TimelineView title="Title 2" />
// //   //         <Pressable
// //   //             onPress={animateButton}
// //   //             style={styles.add_timeline_button_wrapper}
// //   //         >
// //   //             <Animated.View
// //   //             style={[
// //   //                 styles.add_timeline_button,
// //   //                 { transform: [{ scale: scaleValue }] },
// //   //             ]}
// //   //             >
// //   //             <Text style={styles.new_timeline_text}>New Timeline +</Text>
// //   //             </Animated.View>
// //   //         </Pressable>
// //   //         </View>
// //   //     );
// // }

// // const RootStack = createNativeStackNavigator({
// //   screens: {
// //     Home: HomeScreen,
// //   },
// // });

// // const Navigation = createStaticNavigation(RootStack);



// // export default function Index() {
// //   return 
// //     <Navigation />;
// //     // <NavigationContainer>
// //     //   <Stack.Navigator initialRouteName="Home">
// //     //     <Stack.Screen name="Home" component={HomeScreen} />
// //     //     <Stack.Screen name="Edit" component={EditScreen} />
// //     //   </Stack.Navigator>
// //     // </NavigationContainer>

// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     alignItems: "center",
// //     backgroundColor: "#25292e",
// //     paddingTop: 60,
// //   },
// //   title: {
// //     textAlign: "center",
// //     color: "magenta",
// //     fontSize: 30,
// //     fontFamily: "Futura",
// //     marginBottom: 20,
// //   },
// //   add_timeline_button_wrapper: {
// //     position: "absolute",
// //     bottom: 30,
// //     left: 0,
// //     right: 0,
// //     alignItems: "center",
// //   },
// //   add_timeline_button: {
// //     borderWidth: 2,
// //     borderColor: "magenta",
// //     borderRadius: 20,
// //     paddingHorizontal: 30,
// //     paddingVertical: 5,
// //     backgroundColor: "magenta",
// //   },
// //   new_timeline_text: {
// //     fontFamily: "Futura",
// //     color: "#25292e",
// //     fontSize: 20,
// //   },
// // });

// import * as React from "react";
// import { View, Text } from "react-native";
// import {
//   createNativeStackNavigator,
//   NativeStackNavigationProp,
// } from "@react-navigation/native-stack";
// import { NavigationContainer } from "@react-navigation/native";

// // Define the param list for the stack navigator
// type RootStackParamList = {
//   Home: undefined; // No params for the Home screen
// };

// // Create the stack navigator with the param list
// const Stack = createNativeStackNavigator<RootStackParamList>();

// function HomeScreen() {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Text>Home Screen</Text>
//     </View>
//   );
// }

// export default function App() {
//   return (
//       <Stack.Navigator initialRouteName="Home">
//         <Stack.Screen name="Home" component={HomeScreen} />
//       </Stack.Navigator>
//   );
// }

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