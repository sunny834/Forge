import { describe, expect, it } from "vitest";
import { addPoint, historyReducer, initHistory, isComplete, MAX_HISTORY, type Stroke } from "../lib/coloring";

const stroke: Stroke = { tool: "brush", color: "#000000", size: 8, points: [1, 1, 5, 5] };

describe("historyReducer", () => {
  it("fills, undoes and redoes", () => {
    let h = initHistory();
    h = historyReducer(h, { type: "fill", regionId: "sky", color: "#ff0000" });
    h = historyReducer(h, { type: "fill", regionId: "sun", color: "#ffff00" });
    expect(h.present.fills).toEqual({ sky: "#ff0000", sun: "#ffff00" });

    h = historyReducer(h, { type: "undo" });
    expect(h.present.fills).toEqual({ sky: "#ff0000" });
    h = historyReducer(h, { type: "redo" });
    expect(h.present.fills).toEqual({ sky: "#ff0000", sun: "#ffff00" });
  });

  it("ignores repeat fills with the same colour", () => {
    const h1 = historyReducer(initHistory(), { type: "fill", regionId: "sky", color: "#ff0000" });
    expect(historyReducer(h1, { type: "fill", regionId: "sky", color: "#ff0000" })).toBe(h1);
  });

  it("drops redo history after a new action", () => {
    let h = historyReducer(initHistory(), { type: "stroke", stroke });
    h = historyReducer(h, { type: "undo" });
    expect(h.future).toHaveLength(1);
    h = historyReducer(h, { type: "fill", regionId: "a", color: "#111111" });
    expect(h.future).toHaveLength(0);
  });

  it("clear is undoable and a no-op on a blank page", () => {
    const blank = initHistory();
    expect(historyReducer(blank, { type: "clear" })).toBe(blank);
    let h = historyReducer(blank, { type: "stroke", stroke });
    h = historyReducer(h, { type: "clear" });
    expect(h.present.strokes).toHaveLength(0);
    h = historyReducer(h, { type: "undo" });
    expect(h.present.strokes).toHaveLength(1);
  });

  it("caps history length", () => {
    let h = initHistory();
    for (let i = 0; i < MAX_HISTORY + 20; i++) h = historyReducer(h, { type: "fill", regionId: "r", color: `#${String(i).padStart(6, "0")}` });
    expect(h.past).toHaveLength(MAX_HISTORY);
  });

  it("undo/redo at the edges return the same state", () => {
    const h = initHistory();
    expect(historyReducer(h, { type: "undo" })).toBe(h);
    expect(historyReducer(h, { type: "redo" })).toBe(h);
  });
});

describe("helpers", () => {
  it("isComplete requires every region", () => {
    expect(isComplete({ fills: { a: "#1", b: "#2" }, strokes: [] }, ["a", "b"])).toBe(true);
    expect(isComplete({ fills: { a: "#1" }, strokes: [] }, ["a", "b"])).toBe(false);
    expect(isComplete({ fills: {}, strokes: [] }, [])).toBe(false);
  });

  it("addPoint skips points that are too close", () => {
    const pts: number[] = [];
    expect(addPoint(pts, 0, 0)).toBe(true);
    expect(addPoint(pts, 0.5, 0.5)).toBe(false);
    expect(addPoint(pts, 3, 4)).toBe(true);
    expect(pts).toEqual([0, 0, 3, 4]);
  });
});
