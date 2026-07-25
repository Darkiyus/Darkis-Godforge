import type { ImagePresentation } from "./types";

export interface ImagePresentationStyle {
  imageFit: "cover" | "contain";
  imagePosition: string;
  imageTransform: string;
  imageTransformOrigin: string;
}

export function imagePresentationStyle(presentation?: ImagePresentation): ImagePresentationStyle {
  const focusX = clamp(presentation?.focusX, 50, 0, 100);
  const focusY = clamp(presentation?.focusY, 25, 0, 100);
  const zoom = clamp(presentation?.zoom, 1, 1, 3);
  const rotation = clamp(presentation?.rotation, 0, -180, 180);
  return {
    imageFit: presentation?.fit === "contain" ? "contain" : "cover",
    imagePosition: `${focusX}% ${focusY}%`,
    imageTransform: `scale(${zoom}) rotate(${rotation}deg)`,
    imageTransformOrigin: `${focusX}% ${focusY}%`
  };
}

function clamp(value: number | undefined, fallback: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value! : fallback));
}
