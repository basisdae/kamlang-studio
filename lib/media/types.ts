export const BI_MEDIA_BUCKET = "bi-media";

export const BI_MEDIA_ALLOWED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export type BiMediaMime = (typeof BI_MEDIA_ALLOWED_MIME)[number];

export const BI_MEDIA_MAX_BYTES = 5 * 1024 * 1024;

export type MediaRecord = {
  id: string;
  workspaceId: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  publicUrl: string;
};

export function isAllowedMediaMime(value: string): value is BiMediaMime {
  return (BI_MEDIA_ALLOWED_MIME as readonly string[]).includes(value);
}

/** Safe object name segment — no path separators. */
export function sanitizeMediaFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "image";
  const cleaned = base.replace(/[^\w.\u0E00-\u0E7F-]+/g, "_").slice(0, 120);
  return cleaned.length > 0 ? cleaned : "image";
}
