import type { Stroke } from "./coloring";
import { drawStrokes } from "./draw";
import { VIEW_H, VIEW_W } from "../content/types";

const SCALE = 2;

async function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const xml = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // Decoded images keep their pixels; the URL is no longer needed.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/** Composes fills + brush strokes + line art into a PNG and downloads it. */
export async function downloadPicture(fillSvg: SVGSVGElement, lineSvg: SVGSVGElement, strokes: Stroke[], filename: string) {
  const W = VIEW_W * SCALE;
  const H = VIEW_H * SCALE;
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ctx = out.getContext("2d");
  if (!ctx) return;

  const [fillImg, lineImg] = await Promise.all([svgToImage(fillSvg), svgToImage(lineSvg)]);
  ctx.drawImage(fillImg, 0, 0, W, H);

  // Strokes go on their own layer so the eraser only removes brush paint.
  const brush = document.createElement("canvas");
  brush.width = W;
  brush.height = H;
  const bctx = brush.getContext("2d");
  if (bctx) {
    bctx.scale(SCALE, SCALE);
    drawStrokes(bctx, strokes);
    ctx.drawImage(brush, 0, 0);
  }
  ctx.drawImage(lineImg, 0, 0, W, H);

  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
