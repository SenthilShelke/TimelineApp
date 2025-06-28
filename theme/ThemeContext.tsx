import React, { createContext, useContext, useState } from "react";
import { themes, ColorTheme } from "./themes";

const ThemeContext = createContext<{
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
}>({
  theme: themes[0],
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(themes[1]); // Default

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);