import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth(); // ✅ agora está await

  return NextResponse.json({
    userId: session.userId ?? null,
    sessionId: session.sessionId ?? null,
    debug: "middleware check ✅"
  });
}
