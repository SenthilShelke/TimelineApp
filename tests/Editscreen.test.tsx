import React from "react";
import { act, render, fireEvent, waitFor } from "@testing-library/react-native";
import EditScreen from "../app/EditScreen";
import { navigate } from "expo-router/build/global-state/routing";
import { Keyboard } from "react-native";

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
const mockRoute = { params: { events: [], title: "My Timeline" } };

describe("<EditScreen />", () => {
  it("navigates to the previous screen when the back button is pressed", () => {
    const { getByText } = render(<EditScreen navigation={mockNavigation} route={mockRoute} />);
    const button = getByText("<");
    fireEvent.press(button);
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it("updates the title TextInput value when typing", () => {
    const { getByPlaceholderText } = render(<EditScreen navigation={mockNavigation} route={mockRoute} />);
    const titleInput = getByPlaceholderText("Title");
    fireEvent.changeText(titleInput, "My New Timeline");
    expect(titleInput.props.value).toBe("My New Timeline");
  });

  it("opens EventEditor when 'New Event +' button is pressed", () => {
    const { getByText, queryByText } = render(<EditScreen navigation={mockNavigation} route={mockRoute}/>);
    expect(queryByText("Save")).toBeNull();
    const addEventButton = getByText("Add Event +");
    fireEvent.press(addEventButton);
    expect(getByText("Save")).toBeTruthy();
  });

  it("closes the EventEditor modal when clicking outside of it", () => {
    const { getByText, getByPlaceholderText, queryByPlaceholderText, getByTestId } = render(<EditScreen navigation={mockNavigation} route={mockRoute} />);
    const addEventButton = getByText("Add Event +");
    fireEvent.press(addEventButton);
    expect(getByPlaceholderText("Event Title")).toBeTruthy();
    const dismissArea = getByTestId("dismiss-area");
    fireEvent.press(dismissArea);
    expect(queryByPlaceholderText("Event Title")).toBeNull();
  });
});
