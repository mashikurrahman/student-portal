import type { NextRequest } from "next/server";
import { fail } from "@/lib/api";
import { HttpError } from "@/lib/api";
import { requirePermission } from "@/server/auth/session";
import { buildApprovedBundle } from "@/server/services/bundle-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("document:download");
    const { id } = await params;
    const bundle = await buildApprovedBundle(user, id, {
      ip: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
    });
    return new Response(new Uint8Array(bundle.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${bundle.fileName}"`,
      },
    });
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.status);
    console.error("Bundle download error:", err);
    return fail("Could not generate the document bundle.", 500);
  }
}
