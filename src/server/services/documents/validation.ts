/**
 * Upload validation for student documents. Enforces an allowlist of file types,
 * a maximum size, and magic-byte sniffing to catch spoofed extensions/MIME
 * types (see docs/SECURITY.md S4).
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export interface UploadCandidate {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

function isAllowedMime(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

/** Validates the declared metadata before a pre-signed URL is issued. */
export function validateUploadMetadata(candidate: UploadCandidate): ValidationResult {
  if (candidate.sizeBytes <= 0) {
    return { ok: false, error: "File is empty." };
  }
  if (candidate.sizeBytes > MAX_FILE_BYTES) {
    return { ok: false, error: `File exceeds the ${MAX_FILE_BYTES / (1024 * 1024)} MB limit.` };
  }
  if (!isAllowedMime(candidate.mimeType)) {
    return { ok: false, error: `Unsupported file type. Allowed: PDF, JPEG, PNG.` };
  }
  return { ok: true };
}

/**
 * Sniffs the leading bytes of a file to confirm they match the declared MIME
 * type. Defends against a renamed executable disguised as a PDF/image.
 */
export function sniffMatchesMime(header: Uint8Array, declaredMime: string): boolean {
  const startsWith = (sig: number[]) => sig.every((b, i) => header[i] === b);

  // %PDF
  if (declaredMime === "application/pdf") return startsWith([0x25, 0x50, 0x44, 0x46]);
  // JPEG SOI: FF D8 FF
  if (declaredMime === "image/jpeg") return startsWith([0xff, 0xd8, 0xff]);
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (declaredMime === "image/png")
    return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  return false;
}
