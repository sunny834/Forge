import { describe, expect, it } from "vitest";
import { BOOKS } from "../content/books";
import { VIEW_H, VIEW_W } from "../content/types";

const HEX = /^#[0-9a-f]{6}$/i;

describe("book content", () => {
  it("has unique ids and slugs", () => {
    expect(new Set(BOOKS.map((b) => b.id)).size).toBe(BOOKS.length);
    expect(new Set(BOOKS.map((b) => b.slug)).size).toBe(BOOKS.length);
  });

  for (const book of BOOKS) {
    describe(book.title, () => {
      it("has 12 sequential pages and a valid cover", () => {
        expect(book.pages).toHaveLength(12);
        book.pages.forEach((p, i) => expect(p.index).toBe(i));
        expect(book.pages[book.coverPage]).toBeDefined();
        expect(book.ageMin).toBeLessThanOrEqual(book.ageMax);
      });

      for (const page of book.pages) {
        it(`page ${page.index + 1} is colorable`, () => {
          expect(page.text.trim().length).toBeGreaterThan(10);
          expect(page.regions.length).toBeGreaterThanOrEqual(5);
          expect(page.regions.length).toBeLessThanOrEqual(14);
          const ids = page.regions.map((r) => r.id);
          expect(new Set(ids).size).toBe(ids.length);
          for (const r of page.regions) {
            expect(r.id).toMatch(/^[a-z0-9-]+$/);
            expect(r.suggestedColor).toMatch(HEX);
            if (r.shape.kind === "path") expect(r.shape.d).not.toMatch(/NaN|undefined/);
          }
          // The first region is a full-page background so every tap hits something.
          expect(page.regions[0].shape).toEqual({ kind: "rect", x: 0, y: 0, w: VIEW_W, h: VIEW_H });
        });
      }
    });
  }
});
