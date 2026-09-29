// Builds the print files for one book: interior PDF, full-wrap cover PDF and a store listing.

import { starPath } from "../src/content/art";
import type { Book, Page } from "../src/content/types";
import { VIEW_H, VIEW_W } from "../src/content/types";
import { centeredText, drawArt, drawQr, FONT, INK, newDoc, type Doc } from "./render";
import { coverLayout, isRecto, KDP, paddedPageCount, pageMargins, pt, type Paper, type Trim } from "./spec";

export interface PrintConfig {
  brand: string;
  author: string;
  year: number;
  /** Base URL of the hosted web app; the QR codes open the book there. Empty = no QR codes. */
  companionUrl: string;
  paper: Paper;
}

export type InteriorPage =
  | { kind: "title" }
  | { kind: "copyright" }
  | { kind: "belongs" }
  | { kind: "colorTest" }
  | { kind: "howTo" }
  | { kind: "story"; page: Page }
  | { kind: "art"; page: Page }
  | { kind: "theEnd" }
  | { kind: "draw"; prompt: string }
  | { kind: "more" };

/**
 * Page order. Page 1 is a right-hand page, so after 5 front pages every story spread
 * has the text on the left (even) page and the picture to color on the right (odd) page.
 */
export function planInterior(book: Book): InteriorPage[] {
  const pages: InteriorPage[] = [{ kind: "title" }, { kind: "copyright" }, { kind: "belongs" }, { kind: "colorTest" }, { kind: "howTo" }];
  for (const p of book.pages) pages.push({ kind: "story", page: p }, { kind: "art", page: p });
  pages.push({ kind: "theEnd" });
  const total = paddedPageCount(pages.length + 1 + 1); // at least one draw page + "more books"
  const drawCount = total - pages.length - 1;
  for (let i = 0; i < drawCount; i++) {
    pages.push({ kind: "draw", prompt: book.drawPrompts[i] ?? "Draw anything you like!" });
  }
  pages.push({ kind: "more" });
  return pages;
}

export const companionLink = (cfg: PrintConfig, book: Book) =>
  cfg.companionUrl ? `${cfg.companionUrl.replace(/\/+$/, "")}/#/book/${book.slug}/1` : "";

// ---------------------------------------------------------------------------
// Interior
// ---------------------------------------------------------------------------

const TOP = pt(0.6);
const BOTTOM = pt(0.6);

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function roundedFrame(doc: Doc, b: Box, r = 18, width = 3) {
  doc.save().lineWidth(width).strokeColor(INK).roundedRect(b.x, b.y, b.w, b.h, r).stroke().restore();
}

function stars(doc: Doc, list: [number, number, number][]) {
  doc.save().lineWidth(2.5).lineJoin("round").strokeColor(INK);
  for (const [x, y, r] of list) doc.path(starPath(x, y, r)).stroke();
  doc.restore();
}

function uniqueLabels(page: Page, max: number): string[] {
  const seen = new Set<string>();
  for (const r of page.regions) {
    if (r.label === "Sky" || r.label === "Water" || r.label === "Night sky") continue;
    seen.add(r.label.toLowerCase());
    if (seen.size >= max) break;
  }
  return [...seen];
}

export function renderInterior(book: Book, all: Book[], cfg: PrintConfig, trim: Trim): { doc: Doc; pageCount: number } {
  const plan = planInterior(book);
  const W = pt(trim.width);
  const H = pt(trim.height);
  const doc = newDoc({ title: `${book.title}: ${book.subtitle}`, author: cfg.author, subject: "Interior" });
  const link = companionLink(cfg, book);
  const storyNumber = new Map(book.pages.map((p, i) => [p, i + 1]));

  plan.forEach((item, i) => {
    const num = i + 1;
    doc.addPage({ size: [W, H], margin: 0 });
    const m = pageMargins(num, plan.length);
    const box: Box = { x: pt(m.left), y: TOP, w: W - pt(m.left) - pt(m.right), h: H - TOP - BOTTOM - pt(0.35) };
    const cx = box.x;

    switch (item.kind) {
      case "title": {
        let y = box.y + pt(0.3);
        y += centeredText(doc, cfg.brand.toUpperCase(), cx, y, box.w, { font: FONT.semibold, size: 16 }) + pt(0.25);
        y += centeredText(doc, book.title, cx, y, box.w, { font: FONT.bold, size: 46, lineGap: -4 }) + pt(0.1);
        y += centeredText(doc, book.subtitle, cx, y, box.w, { font: FONT.regular, size: 18 }) + pt(0.45);
        const artH = drawArt(doc, book.pages[book.coverPage], cx, y, box.w, { colored: false });
        y += artH + pt(0.4);
        centeredText(doc, `Ages ${book.ageMin}–${book.ageMax}`, cx, y, box.w, { font: FONT.semibold, size: 20 });
        break;
      }
      case "copyright": {
        let y = box.y + pt(0.5);
        y += centeredText(doc, "A tip for grown-ups", cx, y, box.w, { font: FONT.bold, size: 18 }) + pt(0.12);
        centeredText(
          doc,
          "Crayons and colored pencils work best. If you use markers, slip a piece of card behind the page so the color doesn't soak through.",
          cx + pt(0.4),
          y,
          box.w - pt(0.8),
          { font: FONT.regular, size: 13, lineGap: 3 },
        );
        const lines = [
          `${book.title}: ${book.subtitle}`,
          `Text and illustrations © ${cfg.year} ${cfg.author}. All rights reserved.`,
          "No part of this book may be reproduced without written permission from the publisher, except for coloring in the pictures, of course!",
          `First edition ${cfg.year}.`,
          "Set in Fredoka (SIL Open Font License 1.1).",
        ].join("\n\n");
        doc.font(FONT.regular).fontSize(10);
        const h = doc.heightOfString(lines, { width: box.w, align: "center" });
        centeredText(doc, lines, cx, box.y + box.h - h, box.w, { font: FONT.regular, size: 10 });
        break;
      }
      case "belongs": {
        const frame: Box = { x: cx + pt(0.25), y: box.y + pt(1.6), w: box.w - pt(0.5), h: pt(4.2) };
        roundedFrame(doc, frame, 30, 4);
        let y = frame.y + pt(0.7);
        y += centeredText(doc, "This book belongs to", frame.x, y, frame.w, { font: FONT.bold, size: 34 }) + pt(1.1);
        doc.save().lineWidth(2).dash(2, { space: 6 }).moveTo(frame.x + pt(0.6), y).lineTo(frame.x + frame.w - pt(0.6), y).stroke().undash().restore();
        stars(doc, [
          [frame.x + pt(0.6), frame.y - pt(0.6), 26],
          [frame.x + frame.w - pt(0.6), frame.y - pt(0.7), 34],
          [frame.x + frame.w / 2, frame.y + frame.h + pt(0.9), 40],
          [frame.x + pt(0.9), frame.y + frame.h + pt(0.6), 22],
          [frame.x + frame.w - pt(1), frame.y + frame.h + pt(0.7), 26],
        ]);
        break;
      }
      case "colorTest": {
        let y = box.y + pt(0.3);
        y += centeredText(doc, "Test your colors here!", cx, y, box.w, { font: FONT.bold, size: 30 }) + pt(0.1);
        y += centeredText(doc, "Try each crayon or pencil before you start.", cx, y, box.w, { font: FONT.regular, size: 16 }) + pt(0.4);
        const cols = 4;
        const rows = 5;
        const cell = Math.min(box.w / cols, (box.y + box.h - y) / rows);
        const gx = cx + (box.w - cell * cols) / 2;
        doc.save().lineWidth(3).lineJoin("round").strokeColor(INK);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const px = gx + c * cell + cell / 2;
            const py = y + r * cell + cell / 2;
            const s = cell * 0.36;
            switch ((r + c) % 4) {
              case 0:
                doc.circle(px, py, s);
                break;
              case 1:
                doc.roundedRect(px - s, py - s, s * 2, s * 2, 12);
                break;
              case 2:
                doc.path(starPath(px, py, s * 1.15, s * 0.55));
                break;
              default:
                doc.path(`M ${px} ${py + s} C ${px - s * 1.6} ${py} ${px - s * 1.2} ${py - s * 1.4} ${px} ${py - s * 0.6} C ${px + s * 1.2} ${py - s * 1.4} ${px + s * 1.6} ${py} ${px} ${py + s} Z`);
            }
            doc.stroke();
          }
        }
        doc.restore();
        break;
      }
      case "howTo": {
        let y = box.y + pt(0.3);
        y += centeredText(doc, "How to use this book", cx, y, box.w, { font: FONT.bold, size: 32 }) + pt(0.4);
        const steps = [
          "1. Read the story on the left-hand page.",
          "2. Color the picture on the right-hand page.",
          "3. Use any colors you like. Purple dinosaurs are allowed!",
          "4. At the end, draw your own pictures and get your coloring certificate.",
        ];
        for (const s of steps) {
          doc.font(FONT.regular).fontSize(19).fillColor(INK);
          const h = doc.heightOfString(s, { width: box.w - pt(0.6) });
          doc.text(s, cx + pt(0.3), y, { width: box.w - pt(0.6) });
          y += h + pt(0.2);
        }
        if (link) {
          y += pt(0.3);
          const qr = pt(2);
          const frame: Box = { x: cx, y, w: box.w, h: qr + pt(0.6) };
          roundedFrame(doc, frame, 20, 3);
          drawQr(doc, link, frame.x + pt(0.3), frame.y + pt(0.3), qr);
          const tx = frame.x + qr + pt(0.6);
          const tw = frame.w - qr - pt(0.9);
          doc.font(FONT.bold).fontSize(20).fillColor(INK).text("Hear the story read aloud!", tx, frame.y + pt(0.45), { width: tw });
          doc
            .font(FONT.regular)
            .fontSize(14)
            .text("Ask a grown-up to scan this code. You can listen to the story and color every page on a tablet or phone too.", tx, frame.y + pt(0.95), {
              width: tw,
              lineGap: 2,
            });
        }
        break;
      }
      case "story": {
        const n = storyNumber.get(item.page)!;
        const frame: Box = { x: cx, y: box.y + pt(0.2), w: box.w, h: box.h - pt(0.2) };
        roundedFrame(doc, frame, 26, 4);
        centeredText(doc, `~ ${n} ~`, frame.x, frame.y + pt(0.4), frame.w, { font: FONT.semibold, size: 22 });
        const textW = frame.w - pt(1);
        doc.font(FONT.semibold).fontSize(28);
        const th = doc.heightOfString(item.page.text, { width: textW, align: "center", lineGap: 8 });
        centeredText(doc, item.page.text, frame.x + pt(0.5), frame.y + (frame.h - th) / 2 - pt(0.5), textW, {
          font: FONT.semibold,
          size: 28,
          lineGap: 8,
        });
        const find = uniqueLabels(item.page, 5);
        const findText = `Can you find: ${find.join(", ")}?`;
        centeredText(doc, findText, frame.x + pt(0.5), frame.y + frame.h - pt(1.3), textW, { font: FONT.regular, size: 15, lineGap: 2 });
        break;
      }
      case "art": {
        const n = storyNumber.get(item.page)!;
        centeredText(doc, "Color me!", cx, box.y + pt(0.2), box.w, { font: FONT.bold, size: 26 });
        const artW = box.w;
        const artH = (artW * VIEW_H) / VIEW_W;
        const y = box.y + (box.h - artH) / 2 + pt(0.2);
        drawArt(doc, item.page, cx, y, artW, { colored: false, frameWidth: 5 });
        centeredText(doc, `${book.title} · picture ${n}`, cx, y + artH + pt(0.35), box.w, { font: FONT.regular, size: 12 });
        break;
      }
      case "theEnd": {
        let y = box.y + pt(0.2);
        y += centeredText(doc, "The End", cx, y, box.w, { font: FONT.bold, size: 60 }) + pt(0.5);
        const frame: Box = { x: cx + pt(0.2), y, w: box.w - pt(0.4), h: pt(5) };
        roundedFrame(doc, frame, 24, 5);
        doc.save().lineWidth(2).roundedRect(frame.x + 10, frame.y + 10, frame.w - 20, frame.h - 20, 16).stroke().restore();
        let fy = frame.y + pt(0.5);
        fy += centeredText(doc, "Certificate of Coloring", frame.x, fy, frame.w, { font: FONT.bold, size: 30 }) + pt(0.3);
        fy += centeredText(doc, "This is to certify that", frame.x, fy, frame.w, { font: FONT.regular, size: 18 }) + pt(0.75);
        doc.save().lineWidth(2).moveTo(frame.x + pt(1), fy).lineTo(frame.x + frame.w - pt(1), fy).stroke().restore();
        fy += pt(0.25);
        fy += centeredText(doc, `colored every page of\n${book.title}!`, frame.x, fy, frame.w, { font: FONT.semibold, size: 20, lineGap: 4 }) + pt(0.5);
        doc.font(FONT.regular).fontSize(16).fillColor(INK).text("Date:", frame.x + pt(1.2), fy);
        doc.save().lineWidth(2).moveTo(frame.x + pt(1.9), fy + 16).lineTo(frame.x + frame.w - pt(1.2), fy + 16).stroke().restore();
        stars(doc, [
          [cx + box.w / 2, frame.y + frame.h + pt(0.9), 44],
          [cx + box.w / 2 - pt(1.4), frame.y + frame.h + pt(0.8), 28],
          [cx + box.w / 2 + pt(1.4), frame.y + frame.h + pt(0.8), 28],
        ]);
        break;
      }
      case "draw": {
        const titleH = centeredText(doc, item.prompt, cx, box.y + pt(0.1), box.w, { font: FONT.bold, size: 26, lineGap: 2 });
        const top = box.y + titleH + pt(0.4);
        roundedFrame(doc, { x: cx, y: top, w: box.w, h: box.y + box.h - top }, 26, 5);
        break;
      }
      case "more": {
        let y = box.y + pt(0.2);
        y += centeredText(doc, `More ${cfg.brand}`, cx, y, box.w, { font: FONT.bold, size: 34 }) + pt(0.05);
        y += centeredText(doc, "to read and color", cx, y, box.w, { font: FONT.regular, size: 20 }) + pt(0.4);
        const others = all.filter((b) => b.id !== book.id).slice(0, 3);
        const thumbW = pt(3);
        const rowH = (thumbW * VIEW_H) / VIEW_W + pt(0.45);
        for (const other of others) {
          drawArt(doc, other.pages[other.coverPage], cx, y, thumbW, { colored: false, frameWidth: 3 });
          const tx = cx + thumbW + pt(0.3);
          const tw = box.w - thumbW - pt(0.3);
          doc.font(FONT.bold).fontSize(20).fillColor(INK).text(other.title, tx, y + pt(0.35), { width: tw });
          doc.font(FONT.regular).fontSize(13).text(`${other.subtitle}\nAges ${other.ageMin}–${other.ageMax}`, tx, doc.y + 4, { width: tw, lineGap: 2 });
          y += rowH;
        }
        break;
      }
    }

    if (num > 1) {
      doc.font(FONT.semibold).fontSize(12).fillColor(INK);
      const label = String(num);
      const w = doc.widthOfString(label);
      const x = isRecto(num) ? W - pt(pageMargins(num, plan.length).right) - w : pt(pageMargins(num, plan.length).left);
      doc.text(label, x, H - BOTTOM, { lineBreak: false });
    }
  });

  return { doc, pageCount: plan.length };
}

// ---------------------------------------------------------------------------
// Cover (full wrap: back + spine + front, with bleed)
// ---------------------------------------------------------------------------

export function renderCover(book: Book, cfg: PrintConfig, trim: Trim, pageCount: number, opts: { guides?: boolean } = {}) {
  const L = coverLayout(trim, pageCount, cfg.paper);
  const doc = newDoc({ title: `${book.title}: ${book.subtitle}`, author: cfg.author, subject: "Cover" });
  doc.addPage({ size: [pt(L.width), pt(L.height)], margin: 0 });
  const link = companionLink(cfg, book);
  const safe = pt(0.375);

  // Background runs across back, spine and front into the bleed.
  doc.rect(0, 0, pt(L.width), pt(L.height)).fill(book.coverColor);

  // ---- front ----
  const fx = pt(L.frontX) + safe;
  const fw = pt(trim.width) - safe * 2;
  const top = pt(L.trimY) + safe;
  let y = top + pt(0.1);
  y += centeredText(doc, cfg.brand.toUpperCase(), fx, y, fw, { font: FONT.bold, size: 18 }) + pt(0.15);
  y += centeredText(doc, book.title, fx, y, fw, { font: FONT.bold, size: 54, lineGap: -6 }) + pt(0.1);
  y += centeredText(doc, book.subtitle, fx, y, fw, { font: FONT.regular, size: 20 }) + pt(0.4);
  const artW = fw;
  const artH = (artW * VIEW_H) / VIEW_W;
  const pad = pt(0.12);
  doc.roundedRect(fx - pad, y - pad, artW + pad * 2, artH + pad * 2, 26).fill("#ffffff");
  drawArt(doc, book.pages[book.coverPage], fx, y, artW, { colored: true, frameWidth: 5 });
  y += artH + pt(0.55);

  // Age badge + tagline.
  const badgeR = pt(0.62);
  const bx = fx + badgeR;
  const by = y + badgeR;
  doc.save().circle(bx, by, badgeR).fillAndStroke("#ffffff", INK).restore();
  doc.save().lineWidth(4).circle(bx, by, badgeR).stroke(INK).restore();
  centeredText(doc, `Ages\n${book.ageMin}–${book.ageMax}`, bx - badgeR, by - 26, badgeR * 2, { font: FONT.bold, size: 20, lineGap: -2 });
  const tx = fx + badgeR * 2 + pt(0.3);
  doc.font(FONT.bold).fontSize(22).fillColor(INK).text("A Story + Coloring Book", tx, y + pt(0.2), { width: fw - (tx - fx) });
  doc.font(FONT.regular).fontSize(16).text(`${book.pages.length} big pictures to color`, tx, doc.y + 2, { width: fw - (tx - fx) });

  // ---- back ----
  const bxL = pt(L.backX) + safe;
  const bw = pt(trim.width) - safe * 2;
  const bullets = [
    `A gentle rhyming story in ${book.pages.length} parts`,
    `${book.pages.length} big, easy pictures to color`,
    "“Draw your own” activity pages",
    "A coloring certificate to fill in",
    ...(link ? ["Free read-aloud digital edition"] : []),
  ];
  const innerX = bxL + pt(0.35);
  const innerW = bw - pt(0.7);
  const bulletIndent = pt(0.35);
  // Measure first so the white panel fits its text.
  doc.font(FONT.regular).fontSize(15);
  const blurbH = doc.heightOfString(book.blurb, { width: innerW, lineGap: 4 });
  doc.font(FONT.bold).fontSize(17);
  const headH = doc.heightOfString("Inside this book:");
  doc.font(FONT.regular).fontSize(14);
  const bulletHs = bullets.map((b) => doc.heightOfString(b, { width: innerW - bulletIndent }) + 4);
  const panel = { x: bxL, y: top + pt(0.3), w: bw, h: pt(0.35) * 2 + blurbH + pt(0.25) + headH + 6 + bulletHs.reduce((a, b) => a + b, 0) };
  doc.roundedRect(panel.x, panel.y, panel.w, panel.h, 24).fill("#ffffff");
  doc.save().lineWidth(4).roundedRect(panel.x, panel.y, panel.w, panel.h, 24).stroke(INK).restore();
  let yb = panel.y + pt(0.35);
  doc.font(FONT.regular).fontSize(15).fillColor(INK).text(book.blurb, innerX, yb, { width: innerW, lineGap: 4 });
  yb += blurbH + pt(0.25);
  doc.font(FONT.bold).fontSize(17).text("Inside this book:", innerX, yb);
  yb += headH + 6;
  bullets.forEach((b, i) => {
    // Fredoka has no ★ glyph, so the bullet is drawn as a shape.
    doc.save().path(starPath(innerX + pt(0.12), yb + 8, 7, 3.2)).fill(INK).restore();
    doc.font(FONT.regular).fontSize(14).fillColor(INK).text(b, innerX + bulletIndent, yb, { width: innerW - bulletIndent });
    yb += bulletHs[i];
  });

  // Two small line-art previews.
  const thumbs = book.pages.filter((_, i) => i !== book.coverPage).slice(0, 2);
  const tw = (bw - pt(0.3)) / 2;
  const ty = panel.y + panel.h + pt(0.3);
  thumbs.forEach((p, i) => {
    const x = bxL + i * (tw + pt(0.3));
    doc.roundedRect(x - 4, ty - 4, tw + 8, (tw * VIEW_H) / VIEW_W + 8, 14).fill("#ffffff");
    drawArt(doc, p, x, ty, tw, { colored: false, frameWidth: 3 });
  });

  // QR code bottom-left; barcode area bottom-right stays empty white (KDP prints the barcode there).
  const trimBottom = pt(L.trimY + trim.height);
  const bc = KDP.barcode;
  const bcX = pt(L.backX + trim.width - bc.inset - bc.width);
  const bcY = trimBottom - pt(bc.inset + bc.height);
  doc.rect(bcX, bcY, pt(bc.width), pt(bc.height)).fill("#ffffff");
  if (link) {
    const q = pt(1.1);
    const qx = bxL;
    const qy = trimBottom - safe - q;
    doc.roundedRect(qx - 6, qy - 6, q + 12, q + 12, 10).fill("#ffffff");
    drawQr(doc, link, qx, qy, q);
    doc.font(FONT.semibold).fontSize(12).fillColor(INK).text("Scan to hear the story read aloud and color on screen!", qx + q + pt(0.15), qy + pt(0.25), {
      width: bcX - (qx + q + pt(0.3)),
      lineGap: 2,
    });
  }

  // ---- spine ----
  if (L.spineText) {
    const sx = pt(L.spineX + L.spine / 2);
    doc.save().translate(sx, pt(L.height / 2)).rotate(90);
    doc.font(FONT.bold).fontSize(Math.min(18, pt(L.spine - KDP.spineSafety * 2) * 0.8)).fillColor(INK);
    const label = `${book.title} · ${cfg.brand}`;
    doc.text(label, -doc.widthOfString(label) / 2, -doc.currentLineHeight() / 2, { lineBreak: false });
    doc.restore();
  }

  if (opts.guides) drawGuides(doc, L, trim);
  return { doc, layout: L };
}

/** Proof-only overlay: trim lines (red), spine (blue), barcode box (green). Never upload with guides on. */
function drawGuides(doc: Doc, L: ReturnType<typeof coverLayout>, trim: Trim) {
  doc.save().lineWidth(1);
  doc.rect(pt(L.backX), pt(L.trimY), pt(L.width - KDP.bleed * 2), pt(trim.height)).stroke("#ff0000");
  doc.moveTo(pt(L.spineX), 0).lineTo(pt(L.spineX), pt(L.height)).moveTo(pt(L.frontX), 0).lineTo(pt(L.frontX), pt(L.height)).stroke("#0066ff");
  const bc = KDP.barcode;
  doc.rect(pt(L.backX + trim.width - bc.inset - bc.width), pt(L.trimY + trim.height - bc.inset - bc.height), pt(bc.width), pt(bc.height)).stroke("#00aa00");
  doc.restore();
}

// ---------------------------------------------------------------------------
// Store listing text (KDP / Etsy / own shop)
// ---------------------------------------------------------------------------

export function listingMarkdown(book: Book, cfg: PrintConfig, trim: Trim, pageCount: number): string {
  const L = coverLayout(trim, pageCount, cfg.paper);
  const link = companionLink(cfg, book);
  const keywords = [
    `coloring book for kids ages ${book.ageMin}-${book.ageMax}`,
    "story coloring book",
    `${book.theme} books for kids`,
    "toddler coloring book big pictures",
    "rhyming picture book",
    "preschool activity book",
    "kids drawing book",
  ];
  return `# ${book.title}: ${book.subtitle}

## Book details
| | |
|---|---|
| Author / publisher | ${cfg.author} |
| Trim size | ${trim.width} x ${trim.height} in, paperback |
| Interior | Black & white, ${cfg.paper} paper, no bleed |
| Pages | ${pageCount} |
| Cover file | ${L.width.toFixed(3)} x ${L.height.toFixed(3)} in (spine ${L.spine.toFixed(3)} in, bleed ${KDP.bleed} in) |
| Reading age | ${book.ageMin}–${book.ageMax} years |
| Companion link | ${link || "_not set: add companionUrl in print/print.config.json_"} |

## Description
${book.blurb}

**Inside this book:**
- A gentle rhyming story in ${book.pages.length} parts, with big easy-to-read text
- ${book.pages.length} large, simple pictures to color, with thick lines for little hands
- A color-test page, "draw your own" activity pages and a coloring certificate
${link ? "- A free read-aloud digital edition (scan the QR code inside)\n" : ""}
## Keywords (KDP allows 7)
${keywords.map((k) => `- ${k}`).join("\n")}

## Suggested categories
- Children's Books › Activities, Crafts & Games › Coloring
- Children's Books › Growing Up & Facts of Life › Friendship, Social Skills & School Life
- Children's Books › Literature & Fiction › Stories in Verse
`;
}
