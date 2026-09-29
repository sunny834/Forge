import type { Artwork } from "./coloring";
import { emptyArtwork, isComplete } from "./coloring";
import type { Book } from "../content/types";

// Per-device progress. Storage can be missing or blocked (private mode), so every access is guarded.

const PREFIX = "colortales:v1";

export const artworkKey = (slug: string, pageIndex: number) => `${PREFIX}:${slug}:${pageIndex}`;

function store(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadArtwork(slug: string, pageIndex: number): Artwork {
  try {
    const raw = store()?.getItem(artworkKey(slug, pageIndex));
    if (!raw) return emptyArtwork();
    const parsed = JSON.parse(raw) as Partial<Artwork>;
    return {
      fills: parsed.fills && typeof parsed.fills === "object" ? parsed.fills : {},
      strokes: Array.isArray(parsed.strokes) ? parsed.strokes : [],
    };
  } catch {
    return emptyArtwork();
  }
}

export function saveArtwork(slug: string, pageIndex: number, artwork: Artwork): void {
  try {
    const s = store();
    if (!s) return;
    const key = artworkKey(slug, pageIndex);
    if (Object.keys(artwork.fills).length === 0 && artwork.strokes.length === 0) s.removeItem(key);
    else s.setItem(key, JSON.stringify(artwork));
  } catch {
    // Quota exceeded or storage blocked: coloring still works for this session.
  }
}

/** Number of pages in the book whose every region has been filled. */
export function completedPages(book: Book): number {
  return book.pages.filter((p) =>
    isComplete(
      loadArtwork(book.slug, p.index),
      p.regions.map((r) => r.id),
    ),
  ).length;
}
