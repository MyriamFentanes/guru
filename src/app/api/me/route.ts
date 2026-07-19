import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";

/** Any authenticated role. Demonstrates the 401 (no session) branch. */
export const GET = withAuth((session) => NextResponse.json(session));
