// Pure coloring state + undo/redo history. Kept free of DOM so it is easy to test.

export type Tool = "fill" | "brush" | "eraser";

export interface Stroke {
  tool: "brush" | "eraser";
  color: string;
  /** Width in art units (800 x 600 space). */
  size: number;
  /** Flat list of x,y pairs in art units. */
  points: number[];
}

export interface Artwork {
  fills: Record<string, string>;
  strokes: Stroke[];
}

export interface History {
  past: Artwork[];
  present: Artwork;
  future: Artwork[];
}

export type Action =
  | { type: "fill"; regionId: string; color: string }
  | { type: "stroke"; stroke: Stroke }
  | { type: "clear" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "load"; artwork: Artwork };

export const MAX_HISTORY = 60;

export const emptyArtwork = (): Artwork => ({ fills: {}, strokes: [] });

export const initHistory = (artwork: Artwork = emptyArtwork()): History => ({
  past: [],
  present: artwork,
  future: [],
});

function commit(h: History, next: Artwork): History {
  return { past: [...h.past, h.present].slice(-MAX_HISTORY), present: next, future: [] };
}

export function historyReducer(h: History, action: Action): History {
  switch (action.type) {
    case "fill": {
      if (h.present.fills[action.regionId] === action.color) return h;
      return commit(h, { ...h.present, fills: { ...h.present.fills, [action.regionId]: action.color } });
    }
    case "stroke":
      if (action.stroke.points.length < 2) return h;
      return commit(h, { ...h.present, strokes: [...h.present.strokes, action.stroke] });
    case "clear":
      if (isBlank(h.present)) return h;
      return commit(h, emptyArtwork());
    case "undo": {
      const prev = h.past[h.past.length - 1];
      if (!prev) return h;
      return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] };
    }
    case "redo": {
      const [next, ...rest] = h.future;
      if (!next) return h;
      return { past: [...h.past, h.present], present: next, future: rest };
    }
    case "load":
      return initHistory(action.artwork);
  }
}

export function isBlank(a: Artwork): boolean {
  return Object.keys(a.fills).length === 0 && a.strokes.length === 0;
}

export function isComplete(a: Artwork, regionIds: string[]): boolean {
  return regionIds.length > 0 && regionIds.every((id) => a.fills[id] !== undefined);
}

/** Adds a point unless it is within `minDist` of the previous one. Returns true if added. */
export function addPoint(points: number[], x: number, y: number, minDist = 1.5): boolean {
  const len = points.length;
  if (len >= 2) {
    const dx = x - points[len - 2];
    const dy = y - points[len - 1];
    if (dx * dx + dy * dy < minDist * minDist) return false;
  }
  points.push(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  return true;
}
