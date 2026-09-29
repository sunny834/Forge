import { beforeEach, describe, expect, it } from "vitest";
import { artworkKey, completedPages, loadArtwork, saveArtwork } from "../lib/storage";
import { BOOKS } from "../content/books";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

describe("storage", () => {
  beforeEach(() => {
    (globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage();
  });

  it("round-trips artwork", () => {
    const art = { fills: { sky: "#8ecae6" }, strokes: [{ tool: "brush" as const, color: "#000000", size: 8, points: [1, 2, 3, 4] }] };
    saveArtwork("book", 2, art);
    expect(loadArtwork("book", 2)).toEqual(art);
  });

  it("removes blank pages and tolerates bad data", () => {
    saveArtwork("book", 0, { fills: { a: "#000000" }, strokes: [] });
    saveArtwork("book", 0, { fills: {}, strokes: [] });
    expect(localStorage.getItem(artworkKey("book", 0))).toBeNull();

    localStorage.setItem(artworkKey("book", 1), "{not json");
    expect(loadArtwork("book", 1)).toEqual({ fills: {}, strokes: [] });
  });

  it("works when storage is unavailable", () => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
    expect(() => saveArtwork("book", 0, { fills: { a: "#000000" }, strokes: [] })).not.toThrow();
    expect(loadArtwork("book", 0)).toEqual({ fills: {}, strokes: [] });
  });

  it("counts fully colored pages", () => {
    const book = BOOKS[0];
    const page = book.pages[0];
    expect(completedPages(book)).toBe(0);
    saveArtwork(book.slug, 0, { fills: Object.fromEntries(page.regions.map((r) => [r.id, "#000000"])), strokes: [] });
    expect(completedPages(book)).toBe(1);
  });
});
