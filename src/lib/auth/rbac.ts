import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import type { Role, SessionPayload } from "@/lib/types";

type Handler = (session: SessionPayload) => Promise<NextResponse> | NextResponse;

/** Wraps an API route handler, requiring a valid session and (optionally)
 * one of the given roles. Returns 401 if unauthenticated, 403 if the
 * session's role isn't allowed. */
export function withAuth(handler: Handler, allowedRoles?: Role[]) {
  return async function () {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(session);
  };
}
