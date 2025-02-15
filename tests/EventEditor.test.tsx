import React from "react";
import { act, render, fireEvent } from "@testing-library/react-native";
import EditScreen from "../app/EditScreen";
import { navigate } from "expo-router/build/global-state/routing";

jest.useFakeTimers();

describe("<EventEditor />", () => {


  it("text input works correctly", () => {
    const { getByText, getByPlaceholderText } = render(
      <EditScreen navigation={{ navigate: jest.fn(), goBack: jest.fn() }} />
    );
  
    const addEventButton = getByText("Add Event +");
    fireEvent.press(addEventButton);
  
    const titleInput = getByPlaceholderText("Event Title");
    fireEvent.changeText(titleInput, "My New Event");

    const descriptionInput = getByPlaceholderText("Description(optional)")
    fireEvent.changeText(descriptionInput, "My New Description");
  
    expect(titleInput.props.value).toBe("My New Event");
    expect(descriptionInput.props.value).toBe("My New Description");
  });

  it("saving events works properly", () => {
    const { getByText, getByPlaceholderText } = render(
      <EditScreen navigation={{ navigate: jest.fn(), goBack: jest.fn() }} />
    );
  
    const addEventButton = getByText("Add Event +");
    fireEvent.press(addEventButton);
  
    const titleInput = getByPlaceholderText("Event Title");
    fireEvent.changeText(titleInput, "My New Event");
  
    const saveButton = getByText("Save");
    fireEvent.press(saveButton);
  
    expect(getByText("My New Event")).toBeTruthy();
  });
  
});
