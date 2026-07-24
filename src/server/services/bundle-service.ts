import archiver from "archiver";
import { notFound } from "@/lib/api";
import { agentRepository } from "@/server/repositories/agent.repository";
import { storage } from "@/server/storage";
import { writeAudit } from "./audit";
import { docTypeLabel } from "@/lib/labels";
import type { AuthUser } from "@/server/auth/session";

/**
 * Builds a zip bundle of an application's APPROVED documents for the assigned
 * agent, and records the download in the audit log (see docs/SECURITY.md S4/S8).
 *
 * With the Phase 1 stub storage there are no real bytes, so each document is
 * represented by a placeholder entry plus a manifest. A real storage adapter
 * streams the actual files without changing callers.
 */
export interface Bundle {
  fileName: string;
  buffer: Buffer;
}

export async function buildApprovedBundle(
  agent: AuthUser,
  applicationId: string,
  context: { ip?: string | null; userAgent?: string | null } = {},
): Promise<Bundle> {
  const app = await agentRepository.findForAgent(applicationId, agent.id);
  if (!app) throw notFound("Application");

  const approved = app.documents.filter((d) => d.reviewStatus === "approved");

  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (c: Buffer) => chunks.push(c));

  const manifest = {
    application: app.id,
    student: app.student.email,
    program: app.program.name,
    generatedAt: new Date().toISOString(),
    documents: approved.map((d) => ({
      type: d.documentType,
      fileName: d.fileName,
      version: d.version,
      storageKey: d.storageKey,
    })),
  };
  archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });

  for (const doc of approved) {
    const downloadUrl = await storage.createDownloadUrl(doc.storageKey);
    const isRealStorage = !downloadUrl.startsWith("https://storage.local/");
    if (isRealStorage) {
      const res = await fetch(downloadUrl);
      const bytes = Buffer.from(await res.arrayBuffer());
      archive.append(bytes, { name: `${docTypeLabel(doc.documentType)}-${doc.fileName}` });
    } else {
      archive.append(
        `Placeholder for ${docTypeLabel(doc.documentType)} (${doc.fileName}).\n` +
          `Storage key: ${doc.storageKey}\n` +
          `Real bytes are included once an S3/R2 storage adapter is configured.\n`,
        { name: `${docTypeLabel(doc.documentType)}-${doc.fileName}.txt` },
      );
    }
  }

  const done = new Promise<void>((resolve, reject) => {
    archive.on("end", () => resolve());
    archive.on("error", reject);
  });
  await archive.finalize();
  await done;

  await writeAudit({
    actorUserId: agent.id,
    action: "document.bundle_download",
    resourceType: "application",
    resourceId: app.id,
    ip: context.ip,
    userAgent: context.userAgent,
    metadata: { count: approved.length },
  });

  return {
    fileName: `application-${app.id}-documents.zip`,
    buffer: Buffer.concat(chunks),
  };
}
