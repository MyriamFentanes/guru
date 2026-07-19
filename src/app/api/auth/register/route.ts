import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/users";

/** Dev-only self-registration. Fine for a single-teacher MVP; revisit
 * (invite-only, admin-created accounts) before opening this up publicly. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (typeof email !== "string" || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "email and a password of at least 8 characters are required" },
      { status: 400 }
    );
  }

  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const user = await createUser(email, password, "teacher");
  return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
}
