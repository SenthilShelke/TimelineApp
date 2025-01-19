import React, { useRef, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Alert,
  Image,
} from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function EventEditor({ visible, onClose }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return visible ? (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.dismissArea}></View>
          </TouchableWithoutFeedback>

          <View style={styles.modalView}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <TextInput
                  style={styles.eventTitleText}
                  placeholder="Event Title"
                  placeholderTextColor="white"
                  maxLength={45}
                />
              </View>
            </TouchableWithoutFeedback>

            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => setSelectedDate(date || selectedDate)}
            />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <TextInput
                  style={styles.descriptionText}
                  placeholder="Description"
                  placeholderTextColor="white"
                  multiline={true}
                  maxLength={260}
                  textAlign="left"
                  textAlignVertical="top"
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  ) : null;
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "70%",
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
  },
  eventTitleText: {
    marginBottom: 15,
    textAlign: "center",
    color: "white",
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#1e1e1e",
    borderColor: "magenta",
    padding: 10,
    fontFamily: "Futura",
    width: 370,
  },
  descriptionText: {
    marginVertical: 15,
    textAlign: "left",
    textAlignVertical: "top",
    color: "white",
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "#1e1e1e",
    borderColor: "magenta",
    width: 370,
    height: 120,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontFamily: "Futura",
  },
  dismissArea: {
    flex: 1,
    width: "100%",
  },
});
