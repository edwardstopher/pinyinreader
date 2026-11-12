/** Reading colors. Hex values are repeated in styles.css; contrast.test.ts locks both. */

export const themeBackgrounds = {
  light: "#f7f4ee",
  lightPaper: "#fffdf9",
  sepia: "#f3ead7",
  sepiaPaper: "#fbf6ea",
  dark: "#141210",
  darkPaper: "#1c1916",
  contrast: "#000000",
} as const;

export const toneColors = {
  classic: {
    light: { 1: "#9E1B1B", 2: "#8A4B00", 3: "#1B6B32", 4: "#154A9A", 5: "#5C5348" },
    dark: { 1: "#FF9B90", 2: "#FFC46B", 3: "#8FD492", 4: "#9DC4FF", 5: "#C8BFB4" },
    contrast: { 1: "#7CC4FF", 2: "#FFE14A", 3: "#6DFFB5", 4: "#FF9BE0", 5: "#FFFFFF" },
    print: { 1: "#9E1B1B", 2: "#8A4B00", 3: "#14602C", 4: "#123E86", 5: "#3E3A36" },
  },
  colorblind: {
    light: { 1: "#0B4F9C", 2: "#8A5A00", 3: "#0C6B55", 4: "#8E2F68", 5: "#5C5348" },
    dark: { 1: "#8EC5FF", 2: "#FFC46B", 3: "#7EE0C8", 4: "#FFA6D2", 5: "#C8BFB4" },
    contrast: { 1: "#7CC4FF", 2: "#FFE14A", 3: "#6DFFB5", 4: "#FF9BE0", 5: "#FFFFFF" },
    print: { 1: "#0A3E86", 2: "#7A4E00", 3: "#0A5C48", 4: "#7A2458", 5: "#3E3A36" },
  },
} as const;

export const uiInk = {
  light: "#1d1a16",
  lightMuted: "#5c564c",
  dark: "#f6f1ea",
  darkMuted: "#c8bfb4",
  accent: "#9c2f1c",
  accentInk: "#ffffff",
} as const;
