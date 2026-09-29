export interface WordSpan {
  word: string;
  start: number;
  end: number;
}

/** Splits text into words with character offsets (for read-aloud highlighting). */
export function splitWords(text: string): WordSpan[] {
  const spans: WordSpan[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) spans.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  return spans;
}

/** Index of the word containing (or starting after) `charIndex`, or -1. */
export function wordAt(spans: WordSpan[], charIndex: number): number {
  for (let i = 0; i < spans.length; i++) {
    if (charIndex < spans[i].end) return i;
  }
  return -1;
}
