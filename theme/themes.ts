export type ColorTheme = {
  name: string;
  colors: {
    primary: string;      // replaces "magenta"
    secondary: string;    // replaces "grey"
    background: string;   // replaces "#25292e" (dark grey)
    card: string;         // replaces "#1e1e1e"
    text: string;         // replaces "white"
    border: string;       // replaces borderColor "magenta"
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
      primary: "#00bcd4",      // cyan
      secondary: "#90a4ae",    // blue-grey
      background: "#102027",   // dark cyan grey
      card: "#37474f",         // dark blue grey
      text: "white",
      border: "#00bcd4",
    },
  },
  {
    name: "Sunset",
    colors: {
      primary: "#ff7043",      // deep orange
      secondary: "#bcaaa4",    // warm grey
      background: "#3e2723",   // dark brown
      card: "#5d4037",         // brown
      text: "white",
      border: "#ff7043",
    },
  },
  {
    name: "Mint",
    colors: {
      primary: "#26a69a",      // teal
      secondary: "#b2dfdb",    // light teal
      background: "#263238",   // dark blue grey
      card: "#37474f",
      text: "white",
      border: "#26a69a",
    },
  },
];