import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import HomeScreen from "../app/HomeScreen";
import { navigate } from "expo-router/build/global-state/routing";

describe("<HomeScreen />", () => {
  it("renders correctly", () => {

    const mockNavigation = {
      navigate: jest.fn(), 
      goBack: jest.fn(),
    };

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);

    expect(getByText("Your Timelines")).toBeTruthy(); 
    expect(getByText("New Timeline +")).toBeTruthy(); 
    expect(getByText("Title 1")).toBeTruthy();
    expect(getByText("Title 2")).toBeTruthy();
  });

  it("navigates to edit screen when new timeline is pressed", () => {
    const mockNavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };

  const { getByText} = render(<HomeScreen navigation={mockNavigation} />);
  const button = getByText("New Timeline +")

  fireEvent.press(button);

  expect(mockNavigation.navigate).toHaveBeenCalledWith("Edit");

  });

});