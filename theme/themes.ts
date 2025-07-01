export type ColorTheme = {
  name: string;
  colors: {
    primary: string; // replaces "magenta"
    secondary: string; // replaces "grey"
    background: string; // replaces "#25292e" (dark grey)
    card: string; // replaces "#1e1e1e"
    text: string; // replaces "white"
    border: string; // replaces borderColor "magenta"
  };
};

export const themes: ColorTheme[] = [
  {
    name: "Default",
    colors: {
      primary: "magenta",
      secondary: "grey",
      background: "#25292e",
      card: "#1e1e1e",
      text: "white",
      border: "magenta",
    },
  },
  {
    name: "Ocean",
    colors: {
      primary: "#00bcd4", // cyan
      secondary: "#90a4ae", // blue-grey
      background: "#102027", // dark cyan grey
      card: "#37474f", // dark blue grey
      text: "white",
      border: "#00bcd4",
    },
  },
  {
    name: "Sunset",
    colors: {
      primary: "#ff7043", // deep orange
      secondary: "#bcaaa4", // warm grey
      background: "#3e2723", // dark brown
      card: "#5d4037", // brown
      text: "white",
      border: "#ff7043",
    },
  },
  {
    name: "Mint",
    colors: {
      primary: "#26a69a", // teal
      secondary: "#b2dfdb", // light teal
      background: "#263238", // dark blue grey
      card: "#37474f",
      text: "white",
      border: "#26a69a",
    },
  },
  {
    name: "Nebula",
    colors: {
      primary: "#9c27b0", // purple
      secondary: "#7b1fa2", // darker purple
      background: "#1a0033", // space black
      card: "#311b92", // deep indigo
      text: "white",
      border: "#9c27b0",
    },
  },
  {
  name: "Strawberry Milk",
  colors: {
    primary: "#ff80ab",      // pink
    secondary: "#ffe4e1",    // misty rose
    background: "#fff0f5",   // lavender blush
    card: "#ffe4e1",         // soft pink
    text: "#4a4a4a",
    border: "#ff80ab",
  },
},
{
  name: "Cyberpunk",
  colors: {
    primary: "#f50057",      // neon pink
    secondary: "#00e5ff",    // neon cyan
    background: "#000000",   // true black
    card: "#1a1a1a",         // off-black
    text: "#e0e0e0",
    border: "#f50057",
  },
},
  {
    name: "Forest",
    colors: {
      primary: "#4caf50", // green
      secondary: "#8bc34a", // light green
      background: "#1b5e20", // dark green
      card: "#2e7d32", // medium green
      text: "white",
      border: "#4caf50",
    },
  },
  {
  name: "Volt",
  colors: {
    primary: "#c6ff00",      // neon lime
    secondary: "#64dd17",    // vibrant green
    background: "#1b1b1b",   // deep dark grey
    card: "#2c2c2c",         // mid grey
    text: "#e0f7fa",         // soft electric blue
    border: "#c6ff00",
  },
},


];
