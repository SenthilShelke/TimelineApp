import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import EditScreen from "../app/EditScreen";

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
const mockRoute = { params: { events: [], title: "My Timeline" } };

describe("<EditScreen />", () => {
  it("updates the title TextInput value when typing", async () => {
    const { getByPlaceholderText } = await render(
      <EditScreen navigation={mockNavigation} route={mockRoute} />
    );
    fireEvent.changeText(getByPlaceholderText("Title"), "My New Timeline");
    await waitFor(() =>
      expect(getByPlaceholderText("Title").props.value).toBe("My New Timeline")
    );
  });

  it("opens EventEditor when 'New Event +' button is pressed", async () => {
    const { getByText, queryByText, findByText } = await render(
      <EditScreen navigation={mockNavigation} route={mockRoute} />
    );
    expect(queryByText("Save")).toBeNull();
    fireEvent.press(getByText("Add Event +"));
    expect(await findByText("Save")).toBeTruthy();
  });

  it("closes the EventEditor modal when clicking outside of it", async () => {
    const { getByText, findByPlaceholderText, queryByPlaceholderText, getByTestId } =
      await render(<EditScreen navigation={mockNavigation} route={mockRoute} />);
    fireEvent.press(getByText("Add Event +"));
    expect(await findByPlaceholderText("Event Title")).toBeTruthy();
    fireEvent.press(getByTestId("dismiss-area"));
    await waitFor(() =>
      expect(queryByPlaceholderText("Event Title")).toBeNull()
    );
  });
});
