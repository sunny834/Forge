# Color Tales

Interactive story + coloring books for kids aged 3–8. Kids read a short illustrated story and color each page on a tablet, phone or computer.

## Features

- **Library** of books with age tags and a "pages colored" badge.
- **Story reader:** big text, swipe / arrow / keyboard navigation, and **Read to me** (browser speech) with word-by-word highlighting.
- **Coloring:** tap-to-fill regions, brush in 3 sizes, eraser, 14-color palette, undo/redo, clear, a progress bar, a celebration when a page is complete, and **Save picture** as a PNG.
- **Progress** is saved on the device (localStorage). There are no accounts, ads or chat.

## Run it

```bash
cd color-tales
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (content checks, undo/redo, storage, read-aloud)
npm run build      # static site in dist/ (works from any folder: relative paths + hash routing)
```

## Printed books

`npm run print` writes ready-to-upload files for every book to `print-out/<book>/`:

| File | What it is |
|---|---|
| `interior.pdf` | 24-page 8.5 x 11 in black & white interior, no bleed, fonts embedded: title, "this book belongs to", color test, how-to (with QR), 6 story/picture spreads, certificate, "draw your own" pages, more books |
| `cover.pdf` | Full-wrap color cover (back + spine + front) with 0.125 in bleed, spine width from page count, KDP barcode area kept clear |
| `listing.md` | Store listing: details, description, 7 keywords and categories |

```bash
npm run print                                    # all books
npm run print -- --book dinos-big-day            # one book
npm run print -- --guides                        # proof: trim/spine/barcode guide lines (don't upload these)
npm run print -- --companion-url https://...     # override the QR link for this run
```

Settings live in `print/print.config.json`. Set these before the first real print:

- **`author`**: the name on the copyright page and listing.
- **`companionUrl`**: where the web app is hosted. QR codes deep-link to each book, and they're left out while this is empty.
- **`paper`**: `white` or `cream`. This changes the spine width.

**Where to use the files:**

- **Amazon KDP (paperback):** upload `interior.pdf` (no bleed, 8.5x11) and `cover.pdf`. Check the cover size against KDP's cover calculator on the first upload.
- **Own shop + print-on-demand (Lulu, Printful, etc.):** the same two files. These services accept letter-size, no-bleed interiors and full-wrap covers with 0.125 in bleed.
- **Local bulk printing:** send both PDFs. Ask the printer whether they want crop marks or a separate front cover.
- **Etsy:** sell printed copies, or offer `interior.pdf` as a printable digital download (letter size prints at home).

The page layout rules (trim, bleed, gutter by page count, spine per page, barcode area) are in `print/spec.ts` and covered by tests.

## Adding a book

Books live in `src/content/books.ts`. Each page is composed from reusable stamps in `src/content/art.ts` (sky, ground, sun, dino, fish, cake…) on an 800 x 600 canvas:

```ts
page(0, "Story text for the page.", (s) => {
  a.sky(s);          // first region is always the full-page background
  a.ground(s, 470);
  a.sun(s, 680, 110, 50, true);
  a.dino(s, 360, 340, 1);
});
```

Every region is a closed shape with an id, a label and a suggested color. Later regions sit on top of earlier ones, and their outlines hide what is behind them. `npm test` checks every page, including unique ids, 5–14 regions per page and valid colors.

## Roadmap

1. **Now:** read + color MVP.
2. **Parent accounts:** cloud save of artworks.
3. **AI content pipeline:** theme to story text to region-based line art, then human review and publishing into the same `Book` / `Page` model.
4. **Print & sell:** print files are done (`npm run print`). Next: host the companion app, set `companionUrl`, then order proof copies.
5. **CI/CD:** `.github/workflows/color-tales.yml` already runs typecheck, tests and build on every push. Next is a deploy step.
