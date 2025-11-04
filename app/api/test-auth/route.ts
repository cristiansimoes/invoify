import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = auth();
    return NextResponse.json({
      userId: session.userId ?? null,
      sessionId: session.sessionId ?? null,
      debug: "middleware check",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, note: "auth() exploded" }, 
      { status: 500 }
    );
  }
}
