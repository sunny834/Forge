// Usage: npm run print [-- --book <slug>] [--companion-url <url>] [--guides] [--out <dir>]
// Writes print-out/<slug>/{interior.pdf, cover.pdf, listing.md} for each book.

import { createWriteStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { BOOKS } from "../src/content/books";
import { listingMarkdown, renderCover, renderInterior, type PrintConfig } from "./book";
import { finish } from "./render";
import { TRIM_LETTER } from "./spec";

const here = path.dirname(fileURLToPath(import.meta.url));
const { values } = parseArgs({
  options: {
    book: { type: "string" },
    guides: { type: "boolean", default: false },
    "companion-url": { type: "string" },
    out: { type: "string", default: path.join(here, "..", "print-out") },
  },
});

const cfg = JSON.parse(readFileSync(path.join(here, "print.config.json"), "utf8")) as PrintConfig;
if (values["companion-url"] !== undefined) cfg.companionUrl = values["companion-url"];
const books = values.book ? BOOKS.filter((b) => b.slug === values.book) : BOOKS;
if (books.length === 0) {
  console.error(`No book with slug "${values.book}". Known: ${BOOKS.map((b) => b.slug).join(", ")}`);
  process.exit(1);
}
if (!cfg.companionUrl) {
  console.warn("! companionUrl is empty in print/print.config.json: books will be built without QR codes.");
}
if (values.guides) console.warn("! --guides is on: these covers are for proofing only, do not upload them.");

for (const book of books) {
  const dir = path.join(values.out!, book.slug);
  mkdirSync(dir, { recursive: true });

  const interior = renderInterior(book, BOOKS, cfg, TRIM_LETTER);
  await finish(interior.doc, createWriteStream(path.join(dir, "interior.pdf")));

  const cover = renderCover(book, cfg, TRIM_LETTER, interior.pageCount, { guides: values.guides });
  await finish(cover.doc, createWriteStream(path.join(dir, "cover.pdf")));

  writeFileSync(path.join(dir, "listing.md"), listingMarkdown(book, cfg, TRIM_LETTER, interior.pageCount));

  const L = cover.layout;
  console.log(
    `✓ ${book.title}: ${interior.pageCount} pages, cover ${L.width.toFixed(3)} x ${L.height.toFixed(3)} in (spine ${L.spine.toFixed(3)} in) → ${path.relative(process.cwd(), dir)}`,
  );
}
