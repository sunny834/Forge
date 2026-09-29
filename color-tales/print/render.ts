// Low-level PDF drawing helpers shared by the interior and cover builders.

import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import type { Page, Shape } from "../src/content/types";
import { VIEW_H, VIEW_W } from "../src/content/types";

export type Doc = PDFKit.PDFDocument;

export const INK = "#000000";
const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "fonts");

export const FONT = { regular: "Fredoka", semibold: "Fredoka-SemiBold", bold: "Fredoka-Bold" } as const;

/** New document with the embedded Fredoka fonts registered (printers require embedded fonts). */
export function newDoc(info: { title: string; author: string; subject: string }): Doc {
  const doc = new PDFDocument({
    autoFirstPage: false,
    margin: 0,
    info: { Title: info.title, Author: info.author, Subject: info.subject, Creator: "Color Tales print pipeline" },
  });
  doc.registerFont(FONT.regular, path.join(FONT_DIR, "Fredoka-Regular.ttf"));
  doc.registerFont(FONT.semibold, path.join(FONT_DIR, "Fredoka-SemiBold.ttf"));
  doc.registerFont(FONT.bold, path.join(FONT_DIR, "Fredoka-Bold.ttf"));
  return doc;
}

function shapePath(doc: Doc, shape: Shape) {
  switch (shape.kind) {
    case "path":
      return doc.path(shape.d);
    case "circle":
      return doc.circle(shape.cx, shape.cy, shape.r);
    case "ellipse":
      return doc.ellipse(shape.cx, shape.cy, shape.rx, shape.ry);
    case "rect":
      return shape.rx ? doc.roundedRect(shape.x, shape.y, shape.w, shape.h, shape.rx) : doc.rect(shape.x, shape.y, shape.w, shape.h);
  }
}

/**
 * Draws a page's art in a rounded frame at (x, y) with the given width (points).
 * Regions are painted in order (fill + outline), so later shapes hide the lines behind them.
 * `colored` uses each region's suggested colour (covers); otherwise pure white for coloring.
 */
export function drawArt(doc: Doc, page: Page, x: number, y: number, width: number, opts: { colored: boolean; frameWidth?: number }) {
  const k = width / VIEW_W;
  const radius = 28;
  doc.save();
  doc.translate(x, y).scale(k);
  doc.roundedRect(0, 0, VIEW_W, VIEW_H, radius).clip();
  doc.lineWidth(4).lineJoin("round").lineCap("round");
  for (const r of page.regions) {
    shapePath(doc, r.shape);
    doc.fillAndStroke(opts.colored ? r.suggestedColor : "#ffffff", INK);
  }
  for (const d of page.details) {
    shapePath(doc, d);
    if (d.solid) doc.fillAndStroke(INK, INK);
    else doc.stroke(INK);
  }
  doc.restore();
  // Frame drawn outside the clip so its full width shows.
  doc.save();
  doc.lineWidth(opts.frameWidth ?? 4).strokeColor(INK);
  doc.roundedRect(x, y, width, (width * VIEW_H) / VIEW_W, radius * k).stroke();
  doc.restore();
  return (width * VIEW_H) / VIEW_W;
}

/** Vector QR code (crisp at any print size) inside a white quiet zone. */
export function drawQr(doc: Doc, text: string, x: number, y: number, size: number) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const quiet = 2;
  const cell = size / (n + quiet * 2);
  doc.save();
  doc.rect(x, y, size, size).fill("#ffffff");
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (qr.modules.get(row, col)) doc.rect(x + (col + quiet) * cell, y + (row + quiet) * cell, cell + 0.05, cell + 0.05);
    }
  }
  doc.fill(INK);
  doc.restore();
}

/** Centered text block; returns the height it used. Never lets PDFKit auto-add pages. */
export function centeredText(
  doc: Doc,
  text: string,
  x: number,
  y: number,
  width: number,
  opts: { font: string; size: number; color?: string; lineGap?: number },
): number {
  doc.font(opts.font).fontSize(opts.size).fillColor(opts.color ?? INK);
  const h = doc.heightOfString(text, { width, align: "center", lineGap: opts.lineGap ?? 0 });
  doc.text(text, x, y, { width, align: "center", lineGap: opts.lineGap ?? 0, lineBreak: true, height: h + opts.size });
  return h;
}

export function finish(doc: Doc, stream: NodeJS.WritableStream): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve());
    stream.on("error", reject);
    doc.pipe(stream);
    doc.end();
  });
}
