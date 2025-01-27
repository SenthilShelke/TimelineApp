import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../app/HomeScreen";

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
});