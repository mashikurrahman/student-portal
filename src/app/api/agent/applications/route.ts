import { handle, ok } from "@/lib/api";
import { requireUser } from "@/server/auth/session";
import { forbidden } from "@/lib/api";
import { agentRepository } from "@/server/repositories/agent.repository";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => {
    const user = await requireUser();
    if (user.role !== "agent") throw forbidden();
    return ok(await agentRepository.listCaseload(user.id));
  });
}
