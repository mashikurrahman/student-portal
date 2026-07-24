import { randomUUID } from "node:crypto";

/**
 * Object-storage abstraction. Documents are stored in a private bucket and
 * accessed only via short-lived pre-signed URLs (see docs/SECURITY.md S4).
 *
 * A real S3/R2 adapter is wired in Phase 4; for now a stub adapter lets the
 * upload flow run end-to-end without external credentials. The interface is
 * what the rest of the app depends on (Repository/adapter pattern).
 */
export interface PresignedUpload {
  storageKey: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresInSeconds: number;
}

export interface StorageAdapter {
  createUploadUrl(input: {
    applicationId: string;
    documentType: string;
    fileName: string;
    mimeType: string;
  }): Promise<PresignedUpload>;

  createDownloadUrl(storageKey: string): Promise<string>;
}

const PRESIGN_TTL = Number(process.env.STORAGE_PRESIGN_TTL_SECONDS ?? 300);

function buildKey(applicationId: string, documentType: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `applications/${applicationId}/${documentType}/${randomUUID()}-${safeName}`;
}

/**
 * Stub adapter — issues deterministic keys and placeholder URLs. Swap for a
 * real S3/R2 presigner without touching callers.
 */
class StubStorageAdapter implements StorageAdapter {
  async createUploadUrl(input: {
    applicationId: string;
    documentType: string;
    fileName: string;
    mimeType: string;
  }): Promise<PresignedUpload> {
    const storageKey = buildKey(input.applicationId, input.documentType, input.fileName);
    return {
      storageKey,
      uploadUrl: `https://storage.local/upload/${encodeURIComponent(storageKey)}`,
      method: "PUT",
      headers: { "Content-Type": input.mimeType },
      expiresInSeconds: PRESIGN_TTL,
    };
  }

  async createDownloadUrl(storageKey: string): Promise<string> {
    return `https://storage.local/download/${encodeURIComponent(storageKey)}?ttl=${PRESIGN_TTL}`;
  }
}

export const storage: StorageAdapter = new StubStorageAdapter();
