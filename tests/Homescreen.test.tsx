import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import HomeScreen from "../app/HomeScreen";
import { navigate } from "expo-router/build/global-state/routing";

const mockNavigation = {navigate: jest.fn()};
const mockRoute = { params: { events: [], title: "My Timeline" } };

describe("<HomeScreen />", () => {

  it("renders correctly", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} route={mockRoute}/>);
    expect(getByText("Your Timelines")).toBeTruthy(); 
    expect(getByText("New Timeline +")).toBeTruthy(); 
  });

  it("navigates to edit screen when new timeline is pressed", () => {
    const { getByText} = render(<HomeScreen navigation={mockNavigation} route={mockRoute}/>);
    const button = getByText("New Timeline +")
    fireEvent.press(button);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Edit");
  });

});