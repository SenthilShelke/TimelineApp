import React from "react";
import { act, render, fireEvent } from "@testing-library/react-native";
import EditScreen from "../app/EditScreen";
import { navigate } from "expo-router/build/global-state/routing";
import Timeline from "@/components/Timeline";


describe("<EventIcon />", () => {

    it("opens the EventEditor with correct initial data when an event is clicked", () => {
        const { getByText, getByPlaceholderText } = render(
          <EditScreen navigation={{ navigate: jest.fn(), goBack: jest.fn() }} />
        );
    
        const addEventButton = getByText("Add Event +");
        fireEvent.press(addEventButton);
    
        const titleInput = getByPlaceholderText("Event Title");
        const descriptionInput = getByPlaceholderText("Description(optional)");
    
        fireEvent.changeText(titleInput, "My Event");
        fireEvent.changeText(descriptionInput, "This is a test description.");
        fireEvent.press(getByText("Save"));
    
        expect(getByText("My Event")).toBeTruthy();

        fireEvent.press(getByText("My Event"));
    
        expect(getByPlaceholderText("Event Title").props.value).toBe("My Event");
        expect(getByPlaceholderText("Description(optional)").props.value).toBe(
          "This is a test description."
        );
    
        const formattedDate = new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        expect(getByText(formattedDate)).toBeTruthy();
      });
    

  
});
