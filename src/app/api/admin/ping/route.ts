import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";

/** Admin-only example route. Demonstrates the 403 (wrong role) branch:
 * a "teacher" session hits this and gets 403. */
export const GET = withAuth((session) => NextResponse.json({ pong: true, session }), ["admin"]);
