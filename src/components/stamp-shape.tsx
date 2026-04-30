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

// SVG path data for the 100x100 viewBox of each non-rectangular shape.
const SVG_PATHS: Record<"star" | "heart" | "hexagon", string> = {
  // 5-point star, well-balanced
  star:
    "M50 6 L61.8 38.2 L96 38.2 L68.1 58.6 L78.9 91 L50 70.6 L21.1 91 L31.9 58.6 L4 38.2 L38.2 38.2 Z",
  // Classic heart, sits centered in the box
  heart:
    "M50 86 C 18 64 6 46 6 30 C 6 18 16 8 28 8 C 38 8 46 14 50 22 C 54 14 62 8 72 8 C 84 8 94 18 94 30 C 94 46 82 64 50 86 Z",
  // Flat-top hexagon
  hexagon:
    "M50 4 L91 27 L91 73 L50 96 L9 73 L9 27 Z",
};

interface ShapeBoxProps {
  shape: StampShape;
  filled: boolean;
  color: string; // accent color when filled
  children?: ReactNode;
  className?: string;
}

/**
 * Single stamp slot. Square/circle use a div + border. Star/heart/hexagon use an SVG
 * background so the shape stays clean at any size. The emoji is rendered in a centered
 * overlay so it never gets clipped by the shape edges.
 */
export function ShapeBox({ shape, filled, color, children, className = "" }: ShapeBoxProps) {
  const isSvg = shape === "star" || shape === "heart" || shape === "hexagon";

  if (isSvg) {
    const path = SVG_PATHS[shape];
    const muted = "color-mix(in oklab, var(--muted-foreground) 35%, transparent)";
    return (
      <div className={`relative aspect-square w-full ${className}`}>
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <path
            d={path}
            fill={filled ? color : "transparent"}
            stroke={filled ? color : muted}
            strokeWidth={filled ? 0 : 3}
            strokeDasharray={filled ? undefined : "5 4"}
            strokeLinejoin="round"
          />
        </svg>
        {children ? (
          <div
            className="absolute inset-0 grid place-items-center text-[55%] leading-none select-none"
            style={{ color: filled ? "#0a0a0a" : "color-mix(in oklab, var(--muted-foreground) 80%, transparent)" }}
          >
            {children}
          </div>
        ) : null}
      </div>
    );
  }

  // Rectangular shapes (rounded square / circle) — div with border
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  return (
    <div
      className={`aspect-square w-full ${radiusClass} grid place-items-center text-[55%] leading-none border-2 transition-all ${className}`}
      style={{
        background: filled ? color : "transparent",
        borderColor: filled ? color : "color-mix(in oklab, var(--muted-foreground) 35%, transparent)",
        borderStyle: filled ? "solid" : "dashed",
        color: filled ? "#0a0a0a" : "color-mix(in oklab, var(--muted-foreground) 80%, transparent)",
      }}
    >
      {children}
    </div>
  );
}