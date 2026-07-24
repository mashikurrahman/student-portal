import { describe, it, expect } from "vitest";
import {
  validateUploadMetadata,
  sniffMatchesMime,
  MAX_FILE_BYTES,
} from "./validation";

describe("validateUploadMetadata", () => {
  it("accepts a valid PDF within limits", () => {
    expect(
      validateUploadMetadata({ fileName: "a.pdf", mimeType: "application/pdf", sizeBytes: 1024 }).ok,
    ).toBe(true);
  });

  it("rejects an empty file", () => {
    expect(
      validateUploadMetadata({ fileName: "a.pdf", mimeType: "application/pdf", sizeBytes: 0 }).ok,
    ).toBe(false);
  });

  it("rejects an oversized file", () => {
    const res = validateUploadMetadata({
      fileName: "a.pdf",
      mimeType: "application/pdf",
      sizeBytes: MAX_FILE_BYTES + 1,
    });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/limit/i);
  });

  it("rejects a disallowed MIME type", () => {
    const res = validateUploadMetadata({
      fileName: "a.exe",
      mimeType: "application/x-msdownload",
      sizeBytes: 100,
    });
    expect(res.ok).toBe(false);
  });
});

describe("sniffMatchesMime", () => {
  it("matches a real PDF header", () => {
    expect(sniffMatchesMime(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]), "application/pdf")).toBe(true);
  });

  it("matches a real PNG header", () => {
    expect(
      sniffMatchesMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png"),
    ).toBe(true);
  });

  it("rejects a spoofed PDF (wrong magic bytes)", () => {
    expect(sniffMatchesMime(new Uint8Array([0x4d, 0x5a, 0x90, 0x00]), "application/pdf")).toBe(false);
  });
});
