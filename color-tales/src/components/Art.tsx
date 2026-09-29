import { useId, type SVGProps } from "react";
import type { Detail, Page, Shape } from "../content/types";
import { VIEW_H, VIEW_W } from "../content/types";

const INK = "#2b2d42";

export function ShapeEl({ shape, ...props }: { shape: Shape } & SVGProps<SVGElement>) {
  const p = props as SVGProps<never>;
  switch (shape.kind) {
    case "path":
      return <path d={shape.d} {...p} />;
    case "circle":
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...p} />;
    case "ellipse":
      return <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...p} />;
    case "rect":
      return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...p} />;
  }
}

const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
  width: VIEW_W,
  height: VIEW_H,
} as const;

interface FillLayerProps {
  page: Page;
  fills: Record<string, string>;
  /** Show suggested colours instead of the child's fills (cover thumbnails). */
  preview?: boolean;
  onRegionTap?: (regionId: string) => void;
  svgRef?: React.Ref<SVGSVGElement>;
  className?: string;
}

/** The colourable regions, filled with the child's colours (no outlines). */
export function FillLayer({ page, fills, preview, onRegionTap, svgRef, className }: FillLayerProps) {
  return (
    <svg {...svgProps} ref={svgRef} className={className} role="img" aria-label="Coloring picture">
      {page.regions.map((r) => (
        <ShapeEl
          key={r.id}
          shape={r.shape}
          fill={preview ? r.suggestedColor : (fills[r.id] ?? "#ffffff")}
          fillRule="nonzero"
          data-region={r.id}
          onClick={onRegionTap ? () => onRegionTap(r.id) : undefined}
        >
          <title>{r.label}</title>
        </ShapeEl>
      ))}
    </svg>
  );
}

/**
 * Black line art drawn above the fills and brush strokes. Never intercepts taps.
 * Built as a mask so each region hides the outlines of regions behind it,
 * exactly like the stacking of the fill layer.
 */
export function LineLayer({ page, svgRef, className }: { page: Page; svgRef?: React.Ref<SVGSVGElement>; className?: string }) {
  const maskId = `lines-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg {...svgProps} ref={svgRef} className={className} aria-hidden="true" pointerEvents="none">
      <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={VIEW_W} height={VIEW_H}>
        <g stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
          {page.regions.map((r) => (
            <ShapeEl key={r.id} shape={r.shape} fill="#000" />
          ))}
          {page.details.map((d: Detail, i) => (
            <ShapeEl key={i} shape={d} fill={d.solid ? "#fff" : "none"} />
          ))}
        </g>
      </mask>
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill={INK} mask={`url(#${maskId})`} />
    </svg>
  );
}

/** Static, non-interactive picture (book covers). */
export function ArtThumb({ page, fills, preview }: { page: Page; fills?: Record<string, string>; preview?: boolean }) {
  return (
    <div className="art-stack">
      <FillLayer page={page} fills={fills ?? {}} preview={preview} />
      <LineLayer page={page} />
    </div>
  );
}
