import React from "react";
import { act, render, fireEvent } from "@testing-library/react-native";
import EditScreen from "../app/EditScreen";
import { navigate } from "expo-router/build/global-state/routing";

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

    const { getByPlaceholderText } = render(<EditScreen navigation={mockNavigation} />);
    const titleInput = getByPlaceholderText("Title");

    await act(async () => {
      jest.runAllTimers(); 
    });

    expect(titleInput).toBeTruthy(); 
  });
});
