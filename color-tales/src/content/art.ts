// Small vector "stamps" used to compose each page's line art.
// Every stamp adds tappable regions (closed shapes) and optional line details.

import type { Detail, Region, Shape } from "./types";
import { VIEW_H, VIEW_W } from "./types";

const n = (v: number) => Math.round(v * 10) / 10;

export class Scene {
  readonly regions: Region[] = [];
  readonly details: Detail[] = [];
  private counts = new Map<string, number>();

  region(label: string, suggestedColor: string, shape: Shape): this {
    const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const count = (this.counts.get(base) ?? 0) + 1;
    this.counts.set(base, count);
    this.regions.push({ id: count === 1 ? base : `${base}-${count}`, label, suggestedColor, shape });
    return this;
  }

  detail(shape: Shape, solid = false): this {
    this.details.push(solid ? { ...shape, solid } : shape);
    return this;
  }

  line(d: string): this {
    return this.detail({ kind: "path", d });
  }
}

/** Path builder that scales/offsets relative coordinates around an origin. */
function rel(ox: number, oy: number, k: number) {
  return (dx: number, dy: number) => `${n(ox + dx * k)} ${n(oy + dy * k)}`;
}

export function circlePath(cx: number, cy: number, r: number): string {
  return `M ${n(cx - r)} ${n(cy)} a ${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0 a ${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0 Z`;
}

export function starPath(cx: number, cy: number, outer: number, inner = outer * 0.45, points = 5): string {
  const parts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    parts.push(`${i === 0 ? "M" : "L"} ${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}`);
  }
  return parts.join(" ") + " Z";
}

export function heartPath(cx: number, cy: number, s: number): string {
  const p = rel(cx, cy, s);
  return `M ${p(0, 30)} C ${p(-50, 0)} ${p(-40, -45)} ${p(0, -20)} C ${p(40, -45)} ${p(50, 0)} ${p(0, 30)} Z`;
}

/** Puffy cloud outline; flat-ish bottom at y = cy. */
export function cloudPath(cx: number, cy: number, w: number): string {
  const l = cx - w / 2;
  const h = w * 0.5;
  return [
    `M ${n(l)} ${n(cy)}`,
    `A ${n(w * 0.16)} ${n(w * 0.16)} 0 0 1 ${n(l + w * 0.22)} ${n(cy - h * 0.45)}`,
    `A ${n(w * 0.22)} ${n(w * 0.22)} 0 0 1 ${n(l + w * 0.62)} ${n(cy - h * 0.62)}`,
    `A ${n(w * 0.18)} ${n(w * 0.18)} 0 0 1 ${n(l + w * 0.9)} ${n(cy - h * 0.3)}`,
    `A ${n(w * 0.1)} ${n(w * 0.1)} 0 0 1 ${n(l + w)} ${n(cy)}`,
    `Q ${n(cx)} ${n(cy + h * 0.18)} ${n(l)} ${n(cy)} Z`,
  ].join(" ");
}

// ---------- backgrounds ----------

export function sky(s: Scene, color = "#8ecae6", label = "Sky") {
  s.region(label, color, { kind: "rect", x: 0, y: 0, w: VIEW_W, h: VIEW_H });
}

export function ground(s: Scene, y: number, label = "Grass", color = "#80b918") {
  s.region(label, color, {
    kind: "path",
    d: `M 0 ${y} Q 200 ${y - 40} 400 ${y} T 800 ${y - 10} L 800 ${VIEW_H} L 0 ${VIEW_H} Z`,
  });
}

export function hill(s: Scene, cx: number, baseY: number, w: number, h: number, color = "#b5e48c") {
  s.region("Hill", color, {
    kind: "path",
    // Both feet end well below the base so the ground in front always hides them.
    d: `M ${n(cx - w / 2)} ${baseY + 80} Q ${cx} ${n(baseY - h * 2 - 80)} ${n(cx + w / 2)} ${baseY + 80} Z`,
  });
}

export function sand(s: Scene, y: number) {
  s.region("Sand", "#f4d58d", {
    kind: "path",
    d: `M 0 ${y} Q 150 ${y - 30} 300 ${y} T 600 ${y} T 800 ${y - 15} L 800 ${VIEW_H} L 0 ${VIEW_H} Z`,
  });
}

// ---------- faces & sky things ----------

export function face(s: Scene, cx: number, cy: number, k = 1, sleepy = false) {
  const p = rel(cx, cy, k);
  if (sleepy) {
    s.line(`M ${p(-22, -6)} Q ${p(-14, 2)} ${p(-6, -6)}`);
    s.line(`M ${p(6, -6)} Q ${p(14, 2)} ${p(22, -6)}`);
  } else {
    s.detail({ kind: "circle", cx: n(cx - 14 * k), cy: n(cy - 6 * k), r: n(5 * k) }, true);
    s.detail({ kind: "circle", cx: n(cx + 14 * k), cy: n(cy - 6 * k), r: n(5 * k) }, true);
  }
  s.line(`M ${p(-12, 10)} Q ${p(0, 22)} ${p(12, 10)}`);
}

export function sun(s: Scene, cx: number, cy: number, r: number, withFace = false) {
  s.region("Sun", "#ffb703", { kind: "circle", cx, cy, r });
  const rays: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    rays.push(
      `M ${n(cx + (r + 12) * Math.cos(a))} ${n(cy + (r + 12) * Math.sin(a))} L ${n(cx + (r + 38) * Math.cos(a))} ${n(cy + (r + 38) * Math.sin(a))}`,
    );
  }
  s.line(rays.join(" "));
  if (withFace) face(s, cx, cy, r / 40);
}

export function moon(s: Scene, cx: number, cy: number, r: number) {
  s.region("Moon", "#ffe66d", {
    kind: "path",
    d: `M ${cx} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy + r} A ${n(r * 0.75)} ${r} 0 1 1 ${cx} ${cy - r} Z`,
  });
}

export function stars(s: Scene, points: [number, number, number][], label = "Stars") {
  s.region(label, "#ffd166", { kind: "path", d: points.map(([x, y, r]) => starPath(x, y, r)).join(" ") });
}

export function cloud(s: Scene, cx: number, cy: number, w: number, label = "Cloud", color = "#ffffff") {
  s.region(label, color, { kind: "path", d: cloudPath(cx, cy, w) });
}

/** Luna: a cloud with a face. */
export function luna(s: Scene, cx: number, cy: number, w: number, sleepy = false) {
  cloud(s, cx, cy, w, "Luna", "#f1faee");
  face(s, cx - w * 0.02, cy - w * 0.16, w / 200, sleepy);
}

export function rainbow(s: Scene, cx: number, cy: number, outer: number, band: number) {
  const colors: [string, string][] = [
    ["Red stripe", "#e63946"],
    ["Orange stripe", "#f4a261"],
    ["Yellow stripe", "#ffd166"],
    ["Green stripe", "#52b788"],
    ["Blue stripe", "#4895ef"],
    ["Purple stripe", "#9d4edd"],
  ];
  colors.forEach(([label, color], i) => {
    const R = outer - i * band;
    const r = R - band;
    s.region(label, color, {
      kind: "path",
      d: `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx - r} ${cy} Z`,
    });
  });
}

export function raindrops(s: Scene, drops: [number, number][], size = 1) {
  const d = drops
    .map(([x, y]) => {
      const p = rel(x, y, size);
      return `M ${p(0, -16)} Q ${p(12, 4)} ${p(0, 10)} Q ${p(-12, 4)} ${p(0, -16)} Z`;
    })
    .join(" ");
  s.region("Raindrops", "#4cc9f0", { kind: "path", d });
}

// ---------- plants ----------

/** Flower with a stem line; `droopy` bends the stem. */
export function flower(s: Scene, x: number, groundY: number, h: number, color: string, droopy = false) {
  const top: [number, number] = droopy ? [x + h * 0.35, groundY - h * 0.75] : [x, groundY - h];
  s.line(`M ${x} ${groundY} Q ${droopy ? x + h * 0.1 : x - 10} ${groundY - h * 0.6} ${top[0]} ${top[1]}`);
  const r = h * 0.34;
  const pts: string[] = [];
  const petals = 6;
  for (let i = 0; i <= petals; i++) {
    const a = (i * 2 * Math.PI) / petals;
    const px = n(top[0] + r * Math.cos(a));
    const py = n(top[1] + r * Math.sin(a));
    pts.push(i === 0 ? `M ${px} ${py}` : `A ${n(r * 0.55)} ${n(r * 0.55)} 0 0 1 ${px} ${py}`);
  }
  s.region("Petals", color, { kind: "path", d: pts.join(" ") + " Z" });
  s.region("Flower middle", "#ffd166", { kind: "circle", cx: n(top[0]), cy: n(top[1]), r: n(r * 0.45) });
}

export function tree(s: Scene, x: number, groundY: number, k = 1) {
  const p = rel(x, groundY, k);
  s.region("Tree trunk", "#9c6644", { kind: "path", d: `M ${p(-22, 0)} L ${p(-16, -150)} L ${p(16, -150)} L ${p(22, 0)} Z` });
  s.region("Leaves", "#52b788", { kind: "path", d: cloudPath(x, groundY - 130 * k, 230 * k) });
}

export function seaweed(s: Scene, x: number, baseY: number, h: number) {
  const p = rel(x, baseY, h / 100);
  s.region("Seaweed", "#2d6a4f", {
    kind: "path",
    d: `M ${p(-10, 0)} Q ${p(-30, -25)} ${p(-8, -50)} T ${p(-6, -100)} Q ${p(10, -75)} ${p(12, -50)} T ${p(12, 0)} Z`,
  });
}

// ---------- characters ----------

/** Friendly dinosaur facing right. (x, y) is the body centre; feet sit at y + 100k. */
export function dino(s: Scene, x: number, y: number, k = 1, sleepy = false) {
  const p = rel(x, y, k);
  s.region("Dino tail", "#80ed99", { kind: "path", d: `M ${p(-70, 5)} Q ${p(-150, 20)} ${p(-195, -35)} Q ${p(-140, 55)} ${p(-55, 50)} Z` });
  s.region("Dino spikes", "#f4a261", {
    kind: "path",
    d: `M ${p(-75, -30)} L ${p(-60, -78)} L ${p(-38, -52)} L ${p(-15, -92)} L ${p(5, -60)} L ${p(28, -96)} L ${p(45, -45)} Z`,
  });
  s.region("Dino legs", "#57cc99", {
    kind: "path",
    d: `M ${p(-60, 30)} L ${p(-22, 30)} L ${p(-22, 100)} L ${p(-60, 100)} Z M ${p(22, 30)} L ${p(60, 30)} L ${p(60, 100)} L ${p(22, 100)} Z`,
  });
  s.region("Dino body", "#80ed99", { kind: "ellipse", cx: n(x), cy: n(y), rx: n(95 * k), ry: n(62 * k) });
  s.region("Dino belly", "#fefae0", { kind: "ellipse", cx: n(x + 5 * k), cy: n(y + 18 * k), rx: n(52 * k), ry: n(30 * k) });
  s.region("Dino head", "#80ed99", { kind: "ellipse", cx: n(x + 105 * k), cy: n(y - 60 * k), rx: n(58 * k), ry: n(42 * k) });
  if (sleepy) {
    s.line(`M ${p(108, -72)} Q ${p(120, -62)} ${p(132, -72)}`);
  } else {
    s.detail({ kind: "circle", cx: n(x + 120 * k), cy: n(y - 72 * k), r: n(7 * k) }, true);
  }
  s.line(`M ${p(112, -42)} Q ${p(135, -28)} ${p(152, -48)}`);
  s.detail({ kind: "circle", cx: n(x + 150 * k), cy: n(y - 66 * k), r: n(3 * k) }, true);
}

export function partyHat(s: Scene, cx: number, baseY: number, k = 1) {
  const p = rel(cx, baseY, k);
  s.region("Party hat", "#f72585", { kind: "path", d: `M ${p(-35, 0)} L ${p(0, -90)} L ${p(35, 0)} Z` });
  s.region("Pom-pom", "#ffd166", { kind: "circle", cx: n(cx), cy: n(baseY - 95 * k), r: n(12 * k) });
  s.line(`M ${p(-22, -30)} L ${p(20, -40)} M ${p(-12, -58)} L ${p(10, -65)}`);
}

export function ball(s: Scene, cx: number, cy: number, r: number) {
  s.region("Ball", "#e63946", { kind: "circle", cx, cy, r });
  s.line(`M ${cx - r} ${cy} Q ${cx} ${n(cy - r * 0.5)} ${cx + r} ${cy} M ${cx} ${cy - r} Q ${n(cx + r * 0.5)} ${cy} ${cx} ${cy + r}`);
}

export function apple(s: Scene, cx: number, cy: number, r: number, label = "Apple") {
  s.region(label, "#e63946", { kind: "circle", cx, cy, r });
  s.line(`M ${cx} ${n(cy - r)} L ${n(cx + 3)} ${n(cy - r - 14)}`);
}

export function turtle(s: Scene, x: number, groundY: number, k = 1) {
  const p = rel(x, groundY, k);
  s.region("Turtle legs", "#95d5b2", {
    kind: "path",
    d: `M ${p(-55, -20)} L ${p(-30, -20)} L ${p(-30, 0)} L ${p(-55, 0)} Z M ${p(30, -20)} L ${p(55, -20)} L ${p(55, 0)} L ${p(30, 0)} Z`,
  });
  s.region("Turtle head", "#95d5b2", { kind: "circle", cx: n(x + 85 * k), cy: n(groundY - 40 * k), r: n(26 * k) });
  s.region("Turtle shell", "#2d6a4f", { kind: "path", d: `M ${p(-80, -15)} Q ${p(0, -150)} ${p(80, -15)} Z` });
  s.line(`M ${p(-40, -15)} L ${p(-20, -60)} L ${p(20, -60)} L ${p(40, -15)} M ${p(-20, -60)} L ${p(0, -85)} L ${p(20, -60)}`);
  s.detail({ kind: "circle", cx: n(x + 93 * k), cy: n(groundY - 46 * k), r: n(4 * k) }, true);
}

export function bird(s: Scene, cx: number, cy: number, k = 1) {
  const p = rel(cx, cy, k);
  s.region("Bird", "#4895ef", { kind: "circle", cx, cy, r: n(32 * k) });
  s.region("Wing", "#bde0fe", { kind: "path", d: `M ${p(-18, 0)} Q ${p(-5, -30)} ${p(18, 0)} Q ${p(0, 12)} ${p(-18, 0)} Z` });
  s.region("Beak", "#ffb703", { kind: "path", d: `M ${p(30, -8)} L ${p(55, 0)} L ${p(30, 8)} Z` });
  s.detail({ kind: "circle", cx: n(cx + 14 * k), cy: n(cy - 10 * k), r: n(4 * k) }, true);
}

export function slide(s: Scene, x: number, groundY: number) {
  s.region("Ladder", "#ff9f1c", { kind: "rect", x, y: groundY - 260, w: 60, h: 260, rx: 6 });
  s.region("Slide", "#4895ef", {
    kind: "path",
    d: `M ${x + 60} ${groundY - 260} L ${x + 100} ${groundY - 260} Q ${x + 170} ${groundY - 60} ${x + 330} ${groundY - 20} L ${x + 330} ${groundY} Q ${x + 150} ${groundY - 30} ${x + 60} ${groundY - 220} Z`,
  });
  const rungs: string[] = [];
  for (let y = groundY - 230; y < groundY; y += 45) rungs.push(`M ${x + 8} ${y} L ${x + 52} ${y}`);
  s.line(rungs.join(" "));
}

export function blanket(s: Scene, x: number, y: number, w: number, h: number) {
  s.region("Picnic blanket", "#e63946", { kind: "path", d: `M ${x + 30} ${y} L ${x + w - 30} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z` });
  const lines: string[] = [];
  for (let i = 1; i < 4; i++) {
    const t = i / 4;
    lines.push(`M ${n(x + 30 + (w - 60) * t)} ${y} L ${n(x + w * t)} ${y + h}`);
  }
  lines.push(`M ${n(x + 15)} ${n(y + h / 2)} L ${n(x + w - 15)} ${n(y + h / 2)}`);
  s.line(lines.join(" "));
}

export function fish(s: Scene, cx: number, cy: number, k = 1, flip = false) {
  const f = flip ? -1 : 1;
  const p = rel(cx, cy, k);
  s.region("Fish tail", "#ffb703", { kind: "path", d: `M ${p(-60 * f, 0)} L ${p(-115 * f, -40)} L ${p(-105 * f, 0)} L ${p(-115 * f, 40)} Z` });
  s.region("Fish", "#fb8500", { kind: "ellipse", cx: n(cx), cy: n(cy), rx: n(75 * k), ry: n(48 * k) });
  s.region("Fish fin", "#ffb703", { kind: "path", d: `M ${p(-20 * f, -5)} Q ${p(0, -40)} ${p(20 * f, -5)} Q ${p(0, 5)} ${p(-20 * f, -5)} Z` });
  s.region("Fish stripe", "#fefae0", { kind: "path", d: `M ${p(-35 * f, -40)} Q ${p(-50 * f, 0)} ${p(-35 * f, 40)} L ${p(-20 * f, 44)} Q ${p(-35 * f, 0)} ${p(-20 * f, -44)} Z` });
  s.detail({ kind: "circle", cx: n(cx + 40 * f * k), cy: n(cy - 12 * k), r: n(6 * k) }, true);
  s.line(`M ${p(45 * f, 14)} Q ${p(55 * f, 22)} ${p(65 * f, 12)}`);
}

export function octopus(s: Scene, cx: number, cy: number, k = 1) {
  const p = rel(cx, cy, k);
  const legs: string[] = [];
  for (let i = 0; i < 4; i++) {
    const lx = -82 + i * 44;
    legs.push(`M ${p(lx, 20)} Q ${p(lx - 25, 80)} ${p(lx + 5, 130)} Q ${p(lx + 25, 110)} ${p(lx + 18, 80)} Q ${p(lx + 20, 40)} ${p(lx + 35, 20)} Z`);
  }
  s.region("Tentacles", "#c77dff", { kind: "path", d: legs.join(" ") });
  s.region("Olly", "#9d4edd", { kind: "path", d: `M ${p(-95, 35)} Q ${p(-100, -130)} ${p(0, -130)} Q ${p(100, -130)} ${p(95, 35)} Q ${p(0, 60)} ${p(-95, 35)} Z` });
  face(s, cx, cy - 30 * k, k * 1.4);
}

export function bubbles(s: Scene, list: [number, number, number][]) {
  s.region("Bubbles", "#caf0f8", { kind: "path", d: list.map(([x, y, r]) => circlePath(x, y, r)).join(" ") });
}

export function crab(s: Scene, cx: number, cy: number, k = 1) {
  const p = rel(cx, cy, k);
  s.line(`M ${p(-40, 15)} L ${p(-70, 45)} M ${p(-30, 25)} L ${p(-50, 55)} M ${p(40, 15)} L ${p(70, 45)} M ${p(30, 25)} L ${p(50, 55)}`);
  s.line(`M ${p(-45, -10)} L ${p(-70, -45)} M ${p(45, -10)} L ${p(70, -45)}`);
  s.region("Crab claws", "#e63946", { kind: "path", d: `${circlePath(cx - 75 * k, cy - 55 * k, 20 * k)} ${circlePath(cx + 75 * k, cy - 55 * k, 20 * k)}` });
  s.region("Crab", "#f07167", { kind: "ellipse", cx: n(cx), cy: n(cy), rx: n(60 * k), ry: n(38 * k) });
  face(s, cx, cy, k);
}

export function starfish(s: Scene, cx: number, cy: number, r: number) {
  s.region("Starfish", "#ff9f1c", { kind: "path", d: starPath(cx, cy, r, r * 0.5) });
  face(s, cx, cy + r * 0.05, r / 70);
}

export function shells(s: Scene, list: [number, number][]) {
  const d = list
    .map(([x, y]) => {
      const p = rel(x, y, 1);
      return `M ${p(-22, 0)} Q ${p(-22, -30)} ${p(0, -30)} Q ${p(22, -30)} ${p(22, 0)} Z`;
    })
    .join(" ");
  s.region("Shells", "#ffc8dd", { kind: "path", d });
}

export function balloon(s: Scene, cx: number, cy: number, color: string) {
  s.region("Balloon", color, { kind: "ellipse", cx, cy, rx: 42, ry: 52 });
  s.line(`M ${cx} ${cy + 52} Q ${cx - 15} ${cy + 90} ${cx + 5} ${cy + 130}`);
}

export function cake(s: Scene, cx: number, baseY: number) {
  s.region("Cake bottom", "#ffc8dd", { kind: "rect", x: cx - 110, y: baseY - 80, w: 220, h: 80, rx: 12 });
  s.region("Cake top", "#bde0fe", { kind: "rect", x: cx - 75, y: baseY - 145, w: 150, h: 65, rx: 12 });
  const candles = [-45, -15, 15, 45].map((dx) => `M ${cx + dx - 7} ${baseY - 145} L ${cx + dx - 7} ${baseY - 190} L ${cx + dx + 7} ${baseY - 190} L ${cx + dx + 7} ${baseY - 145} Z`);
  s.region("Candles", "#fefae0", { kind: "path", d: candles.join(" ") });
  const flames = [-45, -15, 15, 45].map((dx) => {
    const p = rel(cx + dx, baseY - 200, 1);
    return `M ${p(0, -22)} Q ${p(12, -2)} ${p(0, 8)} Q ${p(-12, -2)} ${p(0, -22)} Z`;
  });
  s.region("Flames", "#ffb703", { kind: "path", d: flames.join(" ") });
  s.line(`M ${cx - 110} ${baseY - 45} Q ${cx - 55} ${baseY - 30} ${cx} ${baseY - 45} T ${cx + 110} ${baseY - 45}`);
}

export function heart(s: Scene, cx: number, cy: number, k: number) {
  s.region("Heart", "#f72585", { kind: "path", d: heartPath(cx, cy, k) });
}

export function rock(s: Scene, cx: number, cy: number, rx: number, ry: number) {
  s.region("Rock", "#adb5bd", { kind: "ellipse", cx, cy, rx, ry });
}

export function puddle(s: Scene, cx: number, cy: number, rx: number) {
  s.region("Puddle", "#4cc9f0", { kind: "ellipse", cx, cy, rx, ry: n(rx * 0.3) });
}

export function envelope(s: Scene, cx: number, cy: number, k = 1, color = "#ffc8dd") {
  const p = rel(cx, cy, k);
  s.region("Invitation", color, { kind: "rect", x: n(cx - 60 * k), y: n(cy - 40 * k), w: n(120 * k), h: n(80 * k), rx: n(6 * k) });
  s.line(`M ${p(-60, -40)} L ${p(0, 5)} L ${p(60, -40)}`);
}

export function present(s: Scene, cx: number, baseY: number, w: number, h: number, color: string) {
  s.region("Present", color, { kind: "rect", x: cx - w / 2, y: baseY - h, w, h, rx: 6 });
  s.region("Bow", "#ffd166", {
    kind: "path",
    d: `M ${cx} ${baseY - h} Q ${cx - 40} ${baseY - h - 45} ${cx - 30} ${baseY - h - 5} Z M ${cx} ${baseY - h} Q ${cx + 40} ${baseY - h - 45} ${cx + 30} ${baseY - h - 5} Z`,
  });
  s.line(`M ${cx} ${baseY - h} L ${cx} ${baseY} M ${cx - w / 2} ${n(baseY - h / 2)} L ${cx + w / 2} ${n(baseY - h / 2)}`);
}

export function musicNote(s: Scene, x: number, y: number, k = 1) {
  s.detail({ kind: "ellipse", cx: x, cy: y, rx: n(11 * k), ry: n(8 * k) }, true);
  s.line(`M ${n(x + 10 * k)} ${y} L ${n(x + 10 * k)} ${n(y - 45 * k)} Q ${n(x + 25 * k)} ${n(y - 35 * k)} ${n(x + 28 * k)} ${n(y - 20 * k)}`);
}

/** Wavy party streamer hung across the scene. */
export function streamer(s: Scene, y: number, color = "#52b788") {
  s.region("Streamer", color, {
    kind: "path",
    d: `M 0 ${y} Q 100 ${y + 60} 200 ${y} T 400 ${y} T 600 ${y} T 800 ${y} L 800 ${y + 18} Q 700 ${y + 78} 600 ${y + 18} T 400 ${y + 18} T 200 ${y + 18} T 0 ${y + 18} Z`,
  });
}

export function bathtub(s: Scene, cx: number, topY: number, w: number) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  s.region("Tub feet", "#ffd166", {
    kind: "path",
    d: `${circlePath(l + 40, topY + 180, 16)} ${circlePath(r - 40, topY + 180, 16)}`,
  });
  s.region("Bathtub", "#ffffff", {
    kind: "path",
    d: `M ${l - 15} ${topY} L ${r + 15} ${topY} L ${r} ${topY + 40} Q ${r - 10} ${topY + 170} ${cx} ${topY + 170} L ${cx} ${topY + 170} Q ${l + 10} ${topY + 170} ${l} ${topY + 40} Z`,
  });
}
