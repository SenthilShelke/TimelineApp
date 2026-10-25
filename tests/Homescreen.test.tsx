import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import HomeScreen from "../app/HomeScreen";

const mockNavigation = { navigate: jest.fn() };
const mockRoute = { params: { events: [], title: "My Timeline" } };

describe("<HomeScreen />", () => {
  it("renders correctly", async () => {
    const { getByText } = await render(
      <HomeScreen navigation={mockNavigation} route={mockRoute} />
    );
    expect(getByText("Your Timelines")).toBeTruthy();
    expect(getByText("New Timeline +")).toBeTruthy();
  });

  it("navigates to edit screen when new timeline is pressed", async () => {
    const { getByText } = await render(
      <HomeScreen navigation={mockNavigation} route={mockRoute} />
    );
    const button = getByText("New Timeline +");
    fireEvent.press(button);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Edit");
  });
});
