import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import type { Role, SessionPayload } from "@/lib/types";

type Handler<Context> = (
  session: SessionPayload,
  req: NextRequest,
  context: Context
) => Promise<NextResponse> | NextResponse;

/** Wraps an API route handler, requiring a valid session and (optionally)
 * one of the given roles. Returns 401 if unauthenticated, 403 if the
 * session's role isn't allowed. */
export function withAuth<Context = unknown>(
  handler: Handler<Context>,
  allowedRoles?: Role[]
) {
  return async function (req: NextRequest, context: Context) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(session, req, context);
  };
}
