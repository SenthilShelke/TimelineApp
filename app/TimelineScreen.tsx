// ViewTimelineScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeContext";
import { ColorTheme } from "@/theme/themes";

const getStyles = (colors: ColorTheme["colors"]) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal: 20,
    },
    image: {
      width: width * 0.97,
      height: 300,
      borderRadius: 20,
      marginBottom: 20,
    },
    imagePlaceholder: {
      width: width * 0.8,
      height: 200,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    eventTitle: {
      fontSize: 26,
      color: colors.primary,
      fontFamily: "Futura",
      marginBottom: 5,
      textAlign: "center",
    },
    timelineTitle: {
      fontSize: 30,
      color: colors.primary,
      fontFamily: "Futura",
      textAlign: "center",
      marginBottom: 20,
      paddingVertical: 5,
      paddingHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    date: {
      fontSize: 16,
      color: 'grey',
      marginBottom: 15,
      fontFamily: "Futura",
    },
    descriptionBox: {
      padding: 0,
      width: "100%",
      marginBottom: 20,
    },
    descriptionText: {
      fontSize: 16,
      color: colors.text,
      fontFamily: "Futura",
      textAlign: "left",
    },
    navigationButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "60%",
      marginBottom: 30,
      color: colors.primary
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
  });

const { width } = Dimensions.get("window");

type TimelineRouteParams = {
  ViewTimeline: {
    title: string;
    events: {
      id: string;
      title: string;
      date: string;
      description: string;
      images: string[];
    }[];
  };
};


export default function ViewTimelineScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
const { theme } = useTheme();
      const colors = theme.colors;
      const styles = getStyles(colors);
  const { title, events: rawEvents } = route.params;
  const events = [...rawEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const backScale = useSharedValue(1);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const images = events[currentIndex]?.images;
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setImageIndex((prev) => (prev + 1) % images.length);
        slideAnim.setValue(width);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, events]);

  if (!events || events.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.eventTitle}>{title}</Text>
        <Text style={styles.descriptionBox}>No events to display.</Text>
      </View>
    );
  }

  const currentEvent = events[pendingIndex ?? currentIndex];
  const currentImage = currentEvent.images?.[imageIndex];

  const fadeToEvent = (newIndex: number) => {
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  }).start(() => {
    setPendingIndex(newIndex); 

    requestAnimationFrame(() => {
      setCurrentIndex(newIndex);
      setImageIndex(0);
      setPendingIndex(null);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  });
};

  const handleNext = () => {
    if (currentIndex < events.length - 1) {
      fadeToEvent(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      fadeToEvent(currentIndex - 1);
    }
  };

  const handleBackButton = () => {
    backScale.value = withTiming(0.9, { duration: 100 }, () => {
          backScale.value = withTiming(1, { duration: 100 });
        });
        navigation.goBack();
  }

  return (
    <View style={styles.container}>
    <Text style={styles.timelineTitle}>{title}</Text>

  <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
    
    {currentImage ? (
      <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
        <Image
          source={{ uri: currentImage }}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>
    ) : (
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={60} color="grey" />
      </View>
    )}

    <Text style={styles.eventTitle}>{currentEvent.title}</Text>
    <Text style={styles.date}>
      {new Date(currentEvent.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </Text>

    <View style={styles.descriptionBox}>
      <Text style={styles.descriptionText}>{currentEvent.description}</Text>
    </View>
  </Animated.View>

  <View style={styles.navigationButtons}>
    <Pressable onPress={handlePrev} disabled={currentIndex === 0}>
      <Ionicons
        name="chevron-back-circle"
        size={40}
        color={currentIndex === 0 ? "grey" : colors.primary}
      />
    </Pressable>

    <Pressable
      onPress={handleNext}
      disabled={currentIndex === events.length - 1}
    >
      <Ionicons
        name="chevron-forward-circle"
        size={40}
        color={currentIndex === events.length - 1 ? "grey" : colors.primary}
      />
    </Pressable>
  </View>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.97,
    height: 300,
    borderRadius: 20,
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: width * 0.8,
    height: 200,
    borderRadius: 20,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 26,
    color: "magenta",
    fontFamily: "Futura",
    marginBottom: 5,
    textAlign: "center",
  },
  timelineTitle: {
  fontSize: 30,
  color: "magenta",
  fontFamily: "Futura",
  textAlign: "center",
  marginBottom: 20,
  paddingVertical: 5,
  paddingHorizontal: 20,
  backgroundColor: "#1e1e1e",
  borderRadius: 10,
  borderWidth: 2,
    borderColor: "magenta",
},
  date: {
    fontSize: 16,
    color: "grey",
    marginBottom: 15,
    fontFamily: "Futura",
  },
  descriptionBox: {
    padding: 0,
    width: "100%",
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: "white",
    fontFamily: "Futura",
    textAlign: "left",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginBottom: 30,
  },
  goBackButtonWrapper: {
  position: "absolute",
  top: 60,
  left: 10,
},
goBackButton: {
  marginTop: 4,
  padding: 7.5,
  backgroundColor: "magenta",
  borderRadius: 10,
}
});