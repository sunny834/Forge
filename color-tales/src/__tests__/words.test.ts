import { describe, expect, it } from "vitest";
import { splitWords, wordAt } from "../lib/words";

describe("words", () => {
  const spans = splitWords("Pitter, patter,  drip!");

  it("keeps character offsets", () => {
    expect(spans.map((s) => s.word)).toEqual(["Pitter,", "patter,", "drip!"]);
    expect(spans[2].start).toBe(17);
  });

  it("maps speech boundaries to words", () => {
    expect(wordAt(spans, 0)).toBe(0);
    expect(wordAt(spans, 8)).toBe(1);
    expect(wordAt(spans, 16)).toBe(2);
    expect(wordAt(spans, 99)).toBe(-1);
  });
});
