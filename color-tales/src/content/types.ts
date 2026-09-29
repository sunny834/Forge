// Content model shared by the app today and the content pipeline later
// (database tables `books` / `pages`, AI generation, print export).

/** Art is drawn on a fixed 800 x 600 canvas. */
export const VIEW_W = 800;
export const VIEW_H = 600;

export type Shape =
  | { kind: "path"; d: string }
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number; rx?: number };

/** A closed shape a child can tap to fill. Later regions sit on top. */
export interface Region {
  id: string;
  label: string;
  suggestedColor: string;
  shape: Shape;
}

/** Line-only (or solid black) decoration drawn over everything: eyes, smiles, rays. */
export type Detail = Shape & { solid?: boolean };

export interface Page {
  index: number;
  text: string;
  regions: Region[];
  details: Detail[];
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  /** Short line under the title on covers and store listings. */
  subtitle: string;
  /** Back-cover / store description. */
  blurb: string;
  /** "Draw your own" activity prompts for the printed book. */
  drawPrompts: string[];
  ageMin: number;
  ageMax: number;
  theme: string;
  /** Background tint for the cover card. */
  coverColor: string;
  /** Index of the page whose art is shown on the cover. */
  coverPage: number;
  pages: Page[];
}
