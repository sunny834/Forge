import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import type { Book, Page } from "../content/types";
import { VIEW_H, VIEW_W } from "../content/types";
import { addPoint, historyReducer, initHistory, isComplete, type Stroke, type Tool } from "../lib/coloring";
import { loadArtwork, saveArtwork } from "../lib/storage";
import { drawStroke, drawStrokes } from "../lib/draw";
import { downloadPicture } from "../lib/exportPng";
import { playChime } from "../lib/chime";
import { BRUSH_SIZES, PALETTE } from "../lib/palette";
import { FillLayer, LineLayer } from "./Art";
import Celebration from "./Celebration";

interface Props {
  book: Book;
  page: Page;
}

export default function ColoringBoard({ book, page }: Props) {
  const [history, dispatch] = useReducer(historyReducer, undefined, () => initHistory(loadArtwork(book.slug, page.index)));
  const art = history.present;
  const [tool, setTool] = useState<Tool>("fill");
  const [color, setColor] = useState(PALETTE[0].color);
  const [size, setSize] = useState(BRUSH_SIZES[1].size);
  const [celebrate, setCelebrate] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fillSvgRef = useRef<SVGSVGElement>(null);
  const lineSvgRef = useRef<SVGSVGElement>(null);
  const liveStroke = useRef<Stroke | null>(null);

  const regionIds = page.regions.map((r) => r.id);
  const complete = isComplete(art, regionIds);
  const wasComplete = useRef(complete);

  // Persist every change.
  useEffect(() => saveArtwork(book.slug, page.index, art), [book.slug, page.index, art]);

  // Celebrate only on the transition to "all regions filled".
  useEffect(() => {
    if (complete && !wasComplete.current) {
      setCelebrate(true);
      playChime();
    }
    wasComplete.current = complete;
  }, [complete]);

  // ---- brush canvas ----
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const k = canvas.width / VIEW_W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    drawStrokes(ctx, art.strokes);
    if (liveStroke.current) drawStroke(ctx, liveStroke.current);
    ctx.globalCompositeOperation = "source-over";
  }, [art.strokes]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(wrap.clientWidth * dpr);
      canvas.width = w;
      canvas.height = Math.round((w * VIEW_H) / VIEW_W);
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [redraw]);

  const toArt = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * VIEW_W, ((e.clientY - rect.top) / rect.height) * VIEW_H] as const;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === "fill") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = toArt(e);
    liveStroke.current = {
      tool,
      color,
      size: tool === "eraser" ? Math.max(size, 28) : size,
      points: [],
    };
    addPoint(liveStroke.current.points, x, y);
    // A single tap still leaves a dot.
    liveStroke.current.points.push(liveStroke.current.points[0], liveStroke.current.points[1]);
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = liveStroke.current;
    if (!s) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    let changed = false;
    for (const ev of events) {
      const [x, y] = toArt(ev);
      changed = addPoint(s.points, x, y) || changed;
    }
    if (changed) redraw();
  };

  const endStroke = () => {
    const s = liveStroke.current;
    liveStroke.current = null;
    if (s) dispatch({ type: "stroke", stroke: s });
  };

  const onRegionTap = (regionId: string) => {
    if (tool === "fill") dispatch({ type: "fill", regionId, color });
  };

  const save = () => {
    if (fillSvgRef.current && lineSvgRef.current) {
      void downloadPicture(fillSvgRef.current, lineSvgRef.current, art.strokes, `${book.slug}-page-${page.index + 1}.png`);
    }
  };

  const filled = regionIds.filter((id) => art.fills[id] !== undefined).length;

  return (
    <section className="board" aria-label="Coloring page">
      <div className="board-art" ref={wrapRef}>
        <div className={`art-stack tool-${tool}`}>
          <FillLayer page={page} fills={art.fills} onRegionTap={onRegionTap} svgRef={fillSvgRef} />
          <canvas
            ref={canvasRef}
            className="brush-layer"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            aria-hidden="true"
          />
          <LineLayer page={page} svgRef={lineSvgRef} />
        </div>
        <div className="fill-progress" aria-label={`${filled} of ${regionIds.length} parts colored`}>
          <span style={{ width: `${(filled / regionIds.length) * 100}%` }} />
        </div>
        {celebrate && <Celebration onDone={() => setCelebrate(false)} />}
      </div>

      <div className="toolbar">
        <div className="tool-group tools" role="radiogroup" aria-label="Tool">
          <ToolButton active={tool === "fill"} onClick={() => setTool("fill")} icon="🪣" label="Fill" />
          <ToolButton active={tool === "brush"} onClick={() => setTool("brush")} icon="🖌️" label="Brush" />
          <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} icon="🧽" label="Eraser" />
        </div>

        {tool !== "fill" && (
          <div className="tool-group sizes" role="radiogroup" aria-label="Brush size">
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.name}
                role="radio"
                aria-checked={size === b.size}
                aria-label={`${b.name} brush`}
                className={`size-btn ${size === b.size ? "active" : ""}`}
                onClick={() => setSize(b.size)}
              >
                <span style={{ width: 8 + b.size * 0.6, height: 8 + b.size * 0.6 }} />
              </button>
            ))}
          </div>
        )}

        <div className="palette" role="radiogroup" aria-label="Colors">
          {PALETTE.map((sw) => (
            <button
              key={sw.color}
              role="radio"
              aria-checked={color === sw.color}
              aria-label={sw.name}
              title={sw.name}
              className={`swatch ${color === sw.color ? "active" : ""}`}
              style={{ background: sw.color }}
              onClick={() => {
                setColor(sw.color);
                if (tool === "eraser") setTool("brush");
              }}
            />
          ))}
        </div>

        <div className="tool-group actions">
          <ToolButton onClick={() => dispatch({ type: "undo" })} disabled={!history.past.length} icon="↩️" label="Undo" />
          <ToolButton onClick={() => dispatch({ type: "redo" })} disabled={!history.future.length} icon="↪️" label="Redo" />
          {confirmClear ? (
            <>
              <ToolButton
                onClick={() => {
                  dispatch({ type: "clear" });
                  setConfirmClear(false);
                }}
                icon="✅"
                label="Yes, clear"
                danger
              />
              <ToolButton onClick={() => setConfirmClear(false)} icon="✖️" label="Keep it" />
            </>
          ) : (
            <ToolButton onClick={() => setConfirmClear(true)} icon="🗑️" label="Clear" />
          )}
          <ToolButton onClick={save} icon="💾" label="Save picture" />
        </div>
      </div>
    </section>
  );
}

function ToolButton(props: { icon: string; label: string; onClick: () => void; active?: boolean; disabled?: boolean; danger?: boolean }) {
  const isToggle = props.active !== undefined;
  return (
    <button
      className={`tool-btn ${props.active ? "active" : ""} ${props.danger ? "danger" : ""}`}
      onClick={props.onClick}
      disabled={props.disabled}
      role={isToggle ? "radio" : undefined}
      aria-checked={isToggle ? props.active : undefined}
    >
      <span className="tool-icon" aria-hidden="true">
        {props.icon}
      </span>
      <span className="tool-label">{props.label}</span>
    </button>
  );
}
