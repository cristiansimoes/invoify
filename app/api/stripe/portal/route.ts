import { getAuth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(req: Request) {
  const { userId } = getAuth(req);

  if (!userId) {
    console.log("❌ No user in getAuth()");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);
  const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;

  if (!stripeCustomerId) {
    console.error("❌ No Stripe customer ID for:", user.emailAddresses[0]?.emailAddress);
    return NextResponse.json({ error: "No customer" }, { status: 400 });
  }

  const hdrs = await headers();
  const originFromHeader = hdrs.get("origin");

  const returnUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    originFromHeader ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://flukeflow-liart.vercel.app");

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return NextResponse.json({ url: session.url });
}
