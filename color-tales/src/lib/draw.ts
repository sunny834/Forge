import type { Stroke } from "./coloring";

/** Draws strokes onto a context already scaled to art units. */
export function drawStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[]) {
  for (const s of strokes) drawStroke(ctx, s);
  ctx.globalCompositeOperation = "source-over";
}

export function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  const pts = s.points;
  if (pts.length < 2) return;
  ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (pts.length === 2) {
    ctx.beginPath();
    ctx.arc(pts[0], pts[1], s.size / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  // Smooth the line through midpoints.
  for (let i = 2; i < pts.length - 2; i += 2) {
    const mx = (pts[i] + pts[i + 2]) / 2;
    const my = (pts[i + 1] + pts[i + 3]) / 2;
    ctx.quadraticCurveTo(pts[i], pts[i + 1], mx, my);
  }
  ctx.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
  ctx.stroke();
}
