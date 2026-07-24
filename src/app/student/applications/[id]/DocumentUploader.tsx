"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { apiFetch } from "@/lib/http";

interface PresignedUpload {
  storageKey: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
}

interface Props {
  applicationId: string;
  documentType: string;
}

/**
 * Handles the pre-signed upload flow: request a URL, PUT the file to object
 * storage, then register the document. Against the Phase 1 stub storage the
 * binary PUT is skipped; a real S3/R2 adapter enables it without UI changes.
 */
export function DocumentUploader({ applicationId, documentType }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const presigned = await apiFetch<PresignedUpload>(
        `/api/applications/${applicationId}/documents/upload-url`,
        {
          method: "POST",
          body: JSON.stringify({
            documentType,
            fileName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          }),
        },
      );

      // Real storage: PUT the bytes to presigned.uploadUrl before registering.
      const isRealStorage = !presigned.uploadUrl.startsWith("https://storage.local/");
      if (isRealStorage) {
        const put = await fetch(presigned.uploadUrl, {
          method: presigned.method,
          headers: presigned.headers,
          body: file,
        });
        if (!put.ok) throw new Error("Upload to storage failed.");
      }

      await apiFetch(`/api/applications/${applicationId}/documents`, {
        method: "POST",
        body: JSON.stringify({
          documentType,
          storageKey: presigned.storageKey,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="text-right">
      <label className="cursor-pointer text-sm font-medium text-brand-600 hover:text-brand-700">
        {busy ? "Uploading…" : "Upload"}
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={onFile}
          disabled={busy}
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
