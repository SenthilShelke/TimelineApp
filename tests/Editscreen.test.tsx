import React from "react";
import { act, render, fireEvent, waitFor } from "@testing-library/react-native";
import EditScreen from "../app/EditScreen";
import { navigate } from "expo-router/build/global-state/routing";
import { Keyboard } from "react-native";

jest.useFakeTimers();

describe("<EditScreen />", () => {
  it("navigates to the previous screen when the back button is pressed", () => {
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByText } = render(<EditScreen navigation={mockNavigation} />);
    const button = getByText("<");

    fireEvent.press(button);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it("automatically focuses the title TextInput when the screen loads", async () => {
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

    const { getByPlaceholderText } = render(
      <EditScreen navigation={mockNavigation} />
    );
    const titleInput = getByPlaceholderText("Title");

    await act(async () => {
      jest.runAllTimers();
    });

    expect(titleInput).toBeTruthy();
  });

  it("opens EventEditor when 'New Event +' button is pressed", () => {
    const { getByText, queryByText } = render(
      <EditScreen navigation={{ navigate: jest.fn(), goBack: jest.fn() }} />
    );

    expect(queryByText("Save")).toBeNull();

    const addEventButton = getByText("Add Event +");

    fireEvent.press(addEventButton);

    expect(getByText("Save")).toBeTruthy();
  });

  it("closes the EventEditor modal when clicking outside of it", () => {
    const { getByText, queryByPlaceholderText, getByTestId } = render(
      <EditScreen navigation={{ navigate: jest.fn(), goBack: jest.fn() }} />
    );
  
    const addEventButton = getByText("Add Event +");
    fireEvent.press(addEventButton);
  
    expect(queryByPlaceholderText("Event Title")).toBeTruthy();
  
    const dismissArea = getByTestId("dismiss-area");
    fireEvent.press(dismissArea);
  
    expect(queryByPlaceholderText("Event Title")).toBeNull();
  });
   

  

  
});
