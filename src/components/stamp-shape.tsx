import type { ReactNode } from "react";

export type StampShape = "rounded" | "circle" | "star" | "heart" | "hexagon";

const SHAPE_LABELS: Record<StampShape, string> = {
  rounded: "Carré arrondi",
  circle: "Cercle",
  star: "Étoile",
  heart: "Cœur",
  hexagon: "Hexagone",
};

export const STAMP_SHAPES: { id: StampShape; label: string }[] = [
  { id: "rounded", label: SHAPE_LABELS.rounded },
  { id: "circle", label: SHAPE_LABELS.circle },
  { id: "star", label: SHAPE_LABELS.star },
  { id: "heart", label: SHAPE_LABELS.heart },
  { id: "hexagon", label: SHAPE_LABELS.hexagon },
];

// CSS clip-paths for irregular shapes
const CLIP_PATHS: Partial<Record<StampShape, string>> = {
  star:
    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  heart:
    "path('M 50 88 C 50 88 12 62 12 36 C 12 22 23 12 35 12 C 43 12 49 17 50 22 C 51 17 57 12 65 12 C 77 12 88 22 88 36 C 88 62 50 88 50 88 Z')",
  hexagon: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)",
};

interface ShapeBoxProps {
  shape: StampShape;
  filled: boolean;
  color: string; // accent color when filled
  children?: ReactNode;
  className?: string;
}

/**
 * Single stamp slot. Uses clip-path for star/heart/hexagon, border-radius for rounded/circle.
 * Filled state: solid accent color. Empty state: muted with dashed border (rounded/circle only).
 */
export function ShapeBox({ shape, filled, color, children, className = "" }: ShapeBoxProps) {
  const isClipped = shape === "star" || shape === "heart" || shape === "hexagon";
  const radiusClass =
    shape === "circle" ? "rounded-full" : shape === "rounded" ? "rounded-xl" : "";

  if (isClipped) {
    return (
      <div
        className={`relative aspect-square w-full ${className}`}
        style={{ clipPath: CLIP_PATHS[shape], WebkitClipPath: CLIP_PATHS[shape] }}
      >
        <div
          className="absolute inset-0 grid place-items-center text-base font-bold transition-all"
          style={{
            background: filled ? color : "color-mix(in oklab, var(--muted) 60%, transparent)",
            color: filled ? "#0a0a0a" : "color-mix(in oklab, var(--muted-foreground) 80%, transparent)",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`aspect-square w-full ${radiusClass} grid place-items-center text-base font-bold border-2 transition-all ${className}`}
      style={{
        background: filled ? color : "transparent",
        borderColor: filled ? color : "color-mix(in oklab, var(--border) 100%, transparent)",
        borderStyle: filled ? "solid" : "dashed",
        color: filled ? "#0a0a0a" : "color-mix(in oklab, var(--muted-foreground) 80%, transparent)",
      }}
    >
      {children}
    </div>
  );
}