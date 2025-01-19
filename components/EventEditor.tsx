import React, { useRef, useState } from "react";
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
} from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (event: { date: string; title: string }) => void;
};

export default function EventEditor({ visible, onClose, onSave }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [title, setTitle] = useState("");
  const scaleValue = useSharedValue(1);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter an event title.");
      return;
    }

    if (!selectedDate) {
      Alert.alert("Error", "Please select a date.");
      return;
    }

    // Save the event
    onSave({ title, date: selectedDate.toLocaleDateString() });

    // Reset fields after successful save
    setTitle("");
    setSelectedDate(null);
    onClose();
  };

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
                  placeholderTextColor="grey"
                  maxLength={45}
                  value={title}
                  onChangeText={(text) => setTitle(text)}
                />
              </View>
            </TouchableWithoutFeedback>

            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                if (date) {
                  setSelectedDate(date);
                }
              }}
            />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <TextInput
                  style={styles.descriptionText}
                  placeholder="Description(optional)"
                  placeholderTextColor="grey"
                  multiline={true}
                  maxLength={260}
                  textAlign="left"
                  textAlignVertical="top"
                />
              </View>
            </TouchableWithoutFeedback>
          </View>

          <Pressable onPress={handleSave} style={styles.saveButtonWrapper}>
            <Animated.View
              style={[
                styles.saveButton,
                { transform: [{ scale: scaleValue }] },
              ]}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Animated.View>
          </Pressable>
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
  saveButton: {
    borderWidth: 2,
    borderColor: "magenta",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 5,
    backgroundColor: "magenta",
    alignItems: "center",
    bottom: 200,
  },
  saveButtonWrapper: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    alignSelf: "center",
    alignItems: "center",
    width: "50%",
    marginLeft: "25%",
  },
  saveButtonText: {
    color: "#1e1e1e",
    fontSize: 20,
    fontFamily: "Futura",
  },
});
