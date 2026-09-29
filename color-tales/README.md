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
4. **Print & sell:** print-ready PDF (8.5x11in with bleed) for KDP/Etsy, plus premium books via checkout.
5. **CI/CD:** `.github/workflows/color-tales.yml` already runs typecheck, tests and build on every push. Next is a deploy step.
