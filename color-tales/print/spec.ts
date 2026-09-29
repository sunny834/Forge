// Print specifications for paperback coloring books (Amazon KDP rules, which
// Lulu / local printers also accept). All sizes are in inches unless noted.
// Re-check against KDP's cover calculator before a first upload.

export const PT_PER_INCH = 72;
export const pt = (inches: number) => inches * PT_PER_INCH;

export interface Trim {
  name: string;
  width: number;
  height: number;
}

export const TRIM_LETTER: Trim = { name: "8.5x11in", width: 8.5, height: 11 };

export const KDP = {
  /** Cover bleed on every outer edge. */
  bleed: 0.125,
  /** Minimum paperback page count. */
  minPages: 24,
  /** Spine thickness per page, black & white interior on white paper. */
  spinePerPageWhite: 0.002252,
  /** Spine thickness per page, black & white interior on cream paper. */
  spinePerPageCream: 0.0025,
  /** Books with fewer pages may not have spine text. */
  spineTextMinPages: 79,
  /** Keep text this far inside the spine edges. */
  spineSafety: 0.0625,
  /** Outside margin for a no-bleed interior (KDP minimum is 0.25in; we add comfort). */
  outsideMargin: 0.5,
  /** Barcode area KDP reserves on the back cover, placed from the bottom/right trim edges. */
  barcode: { width: 2, height: 1.2, inset: 0.25 },
} as const;

/** Inside (gutter) margin required by page count. */
export function gutterMargin(pages: number): number {
  if (pages <= 150) return 0.375;
  if (pages <= 300) return 0.5;
  if (pages <= 500) return 0.625;
  if (pages <= 700) return 0.75;
  return 0.875;
}

export type Paper = "white" | "cream";

export function spineWidth(pages: number, paper: Paper = "white"): number {
  return pages * (paper === "white" ? KDP.spinePerPageWhite : KDP.spinePerPageCream);
}

/** Smallest even page count that is at least `n` and at least the KDP minimum. */
export function paddedPageCount(n: number, min: number = KDP.minPages): number {
  const target = Math.max(n, min);
  return target % 2 === 0 ? target : target + 1;
}

export interface CoverLayout {
  /** Full sheet size including bleed. */
  width: number;
  height: number;
  spine: number;
  /** x of the back cover's left trim edge, the spine's left edge, and the front cover's left edge. */
  backX: number;
  spineX: number;
  frontX: number;
  /** y of the top trim edge. */
  trimY: number;
  spineText: boolean;
}

export function coverLayout(trim: Trim, pages: number, paper: Paper = "white"): CoverLayout {
  const spine = spineWidth(pages, paper);
  const b = KDP.bleed;
  return {
    width: b + trim.width + spine + trim.width + b,
    height: b + trim.height + b,
    spine,
    backX: b,
    spineX: b + trim.width,
    frontX: b + trim.width + spine,
    trimY: b,
    spineText: pages >= KDP.spineTextMinPages,
  };
}

/** Page is recto (right-hand) when its 1-based number is odd. */
export const isRecto = (pageNumber: number) => pageNumber % 2 === 1;

/** Left/right margins for a page: the gutter is on the inside (left of a recto, right of a verso). */
export function pageMargins(pageNumber: number, totalPages: number) {
  const inside = gutterMargin(totalPages);
  const outside = KDP.outsideMargin;
  return isRecto(pageNumber) ? { left: inside, right: outside } : { left: outside, right: inside };
}
