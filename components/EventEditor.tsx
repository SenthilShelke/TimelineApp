import React, { useRef, useState, useEffect } from "react";
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
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (event: { date: string; title: string; description: string; images: string[] }) => void;
  initialDate?: Date;
  initialTitle?: string;
  initialDescription?: string;
  initialImages?: string[];
};

export default function EventEditor({
  visible,
  onClose,
  onSave,
  initialDate,
  initialTitle,
  initialDescription,
  initialImages = [],
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [title, setTitle] = useState(initialTitle || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [images, setImages] = useState<string[]>(initialImages);
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle || "");
      setDescription(initialDescription || "");
      setSelectedDate(initialDate ? new Date(initialDate) : new Date());
      setImages(initialImages);
    }
  }, [visible]);

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert("Maximum image limit reached");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter an event title.");
      return;
    }

    onSave({ title, date: selectedDate.toISOString(), description, images });

    setTitle("");
    setDescription("");
    setSelectedDate(new Date());
    setImages([]);
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
                  value={description}
                  onChangeText={(text) => setDescription(text)}
                />
                <Pressable onPress={pickImage} style={styles.imageButton}>
                  <Text style={styles.imageButtonText}>Add Image (Max 3)</Text>
                </Pressable>

                {/* Display Selected Images */}
                <ScrollView horizontal style={styles.imageContainer}>
                  {images.map((uri, index) => (
                    <Image
                      key={index}
                      source={{ uri }}
                      style={styles.imagePreview}
                    />
                  ))}
                </ScrollView>
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
  imageButton: {
    borderWidth: 2,
    borderColor: "magenta",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "magenta",
    marginVertical: 10,
    alignItems: "center",
  },
  imageButtonText: {
    color: "#1e1e1e",
    fontSize: 16,
    fontFamily: "Futura",
  },
  imageContainer: {
    flexDirection: "row",
    marginVertical: 10,
    marginTop: 60,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "magenta",
  },
});
