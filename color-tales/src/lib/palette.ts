export interface Swatch {
  name: string;
  color: string;
}

export const PALETTE: Swatch[] = [
  { name: "Red", color: "#e63946" },
  { name: "Orange", color: "#fb8500" },
  { name: "Yellow", color: "#ffd166" },
  { name: "Lime", color: "#80ed99" },
  { name: "Green", color: "#2a9d8f" },
  { name: "Sky blue", color: "#8ecae6" },
  { name: "Blue", color: "#4361ee" },
  { name: "Purple", color: "#9d4edd" },
  { name: "Pink", color: "#f72585" },
  { name: "Peach", color: "#ffc8dd" },
  { name: "Brown", color: "#9c6644" },
  { name: "White", color: "#ffffff" },
  { name: "Gray", color: "#adb5bd" },
  { name: "Black", color: "#2b2d42" },
];

export const BRUSH_SIZES = [
  { name: "Small", size: 8 },
  { name: "Medium", size: 18 },
  { name: "Big", size: 36 },
];
