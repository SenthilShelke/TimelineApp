import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import EditScreen from "../app/EditScreen";

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
const mockRoute = { params: { events: [], title: "My Timeline" } };

// Allow the save (onSave -> setEvents -> modal close) to fully settle.
const flush = () => act(() => new Promise((r) => setTimeout(r, 250)));

describe("<EventIcon /> (event creation via EventEditor)", () => {
  afterEach(() => jest.clearAllMocks());

  it("adds an event to the timeline when saved via the EventEditor", async () => {
    const { getByText, getAllByText, getByPlaceholderText, findByPlaceholderText } =
      await render(<EditScreen navigation={mockNavigation} route={mockRoute} />);

    // Open the editor modal.
    fireEvent.press(getByText("Add Event +"));

    // Enter an event title and let the controlled input settle (React 19 / RTL 14).
    const titleInput = await findByPlaceholderText("Event Title");
    fireEvent.changeText(titleInput, "My Event");
    await waitFor(() =>
      expect(getByPlaceholderText("Event Title").props.value).toBe("My Event")
    );

    // Save the event.
    fireEvent.press(getByText("Save"));
    await flush();

    // The new event node now appears on the timeline, showing its title and date.
    expect(getAllByText("My Event").length).toBeGreaterThan(0);
    const formattedDate = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    expect(getAllByText(formattedDate).length).toBeGreaterThan(0);
  });
});
