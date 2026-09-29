import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";
import { BOOKS } from "../content/books";
import { companionLink, planInterior, renderCover, renderInterior, type PrintConfig } from "../../print/book";
import { coverLayout, gutterMargin, isRecto, KDP, paddedPageCount, pageMargins, spineWidth, TRIM_LETTER } from "../../print/spec";
import { finish } from "../../print/render";

const cfg: PrintConfig = { brand: "Color Tales", author: "Test", year: 2026, companionUrl: "https://example.com/app/", paper: "white" };

describe("print spec", () => {
  it("pads to an even page count of at least 24", () => {
    expect(paddedPageCount(10)).toBe(24);
    expect(paddedPageCount(24)).toBe(24);
    expect(paddedPageCount(25)).toBe(26);
  });

  it("uses KDP gutter and spine rules", () => {
    expect(gutterMargin(24)).toBe(0.375);
    expect(gutterMargin(151)).toBe(0.5);
    expect(spineWidth(100)).toBeCloseTo(0.2252, 4);
    expect(spineWidth(100, "cream")).toBeCloseTo(0.25, 4);
  });

  it("lays out a full-wrap cover with bleed", () => {
    const L = coverLayout(TRIM_LETTER, 24);
    expect(L.height).toBeCloseTo(11.25);
    expect(L.width).toBeCloseTo(0.125 * 2 + 8.5 * 2 + 24 * KDP.spinePerPageWhite);
    expect(L.frontX - L.spineX).toBeCloseTo(L.spine);
    expect(L.spineText).toBe(false);
    expect(coverLayout(TRIM_LETTER, 80).spineText).toBe(true);
  });

  it("puts the gutter on the inside edge", () => {
    expect(isRecto(1)).toBe(true);
    expect(pageMargins(1, 24).left).toBe(0.375);
    expect(pageMargins(2, 24).right).toBe(0.375);
  });
});

describe("interior plan", () => {
  for (const book of BOOKS) {
    it(`${book.title}: story on the left, picture on the right`, () => {
      const plan = planInterior(book);
      expect(plan.length).toBeGreaterThanOrEqual(KDP.minPages);
      expect(plan.length % 2).toBe(0);
      plan.forEach((p, i) => {
        if (p.kind === "story") expect(isRecto(i + 1)).toBe(false);
        if (p.kind === "art") expect(isRecto(i + 1)).toBe(true);
      });
      expect(plan.filter((p) => p.kind === "art")).toHaveLength(book.pages.length);
      expect(plan[0].kind).toBe("title");
      expect(plan[plan.length - 1].kind).toBe("more");
    });
  }

  it("builds deep links to the companion app", () => {
    expect(companionLink(cfg, BOOKS[0])).toBe(`https://example.com/app/#/book/${BOOKS[0].slug}/1`);
    expect(companionLink({ ...cfg, companionUrl: "" }, BOOKS[0])).toBe("");
  });
});

describe("pdf output", () => {
  const collect = async (doc: PDFKit.PDFDocument) => {
    const out = new PassThrough();
    const chunks: Buffer[] = [];
    out.on("data", (c: Buffer) => chunks.push(c));
    await finish(doc, out);
    return Buffer.concat(chunks);
  };

  it("renders an interior and cover PDF", async () => {
    const book = BOOKS[0];
    const interior = renderInterior(book, BOOKS, cfg, TRIM_LETTER);
    const ipdf = await collect(interior.doc);
    expect(ipdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(ipdf.toString("latin1").match(/\/Type \/Page\b/g)).toHaveLength(interior.pageCount);

    const cover = renderCover(book, cfg, TRIM_LETTER, interior.pageCount);
    const cpdf = await collect(cover.doc);
    expect(cpdf.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
