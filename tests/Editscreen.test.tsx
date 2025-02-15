import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import EditScreen from "../app/EditScreen";
import { navigate } from "expo-router/build/global-state/routing";

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

});