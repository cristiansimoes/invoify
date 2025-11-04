import Stripe from "stripe";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const email = session?.customer_details?.email;

      if (email) {
        const users = await clerkClient.users.getUserList({
          emailAddress: [email],
        });

        if (users.length > 0) {
          await clerkClient.users.updateUserMetadata(users[0].id, {
            publicMetadata: { isPaid: true },
          });
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Stripe webhook error:", err);
    return new Response("Webhook error", { status: 400 });
  }
}
