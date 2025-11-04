import { headers } from "next/headers";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Listen for successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const email = session.customer_details?.email;

      if (!email) {
        console.log("⚠️ No email found in Stripe session");
        return new Response("No email", { status: 200 });
      }

      // Search user in Clerk by email
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.length === 0) {
        console.log("⚠️ No matching user in Clerk", email);
        return new Response("User not found", { status: 200 });
      }

      const userId = users[0].id;

      await clerkClient.users.updateUser(userId, {
        publicMetadata: { isPaid: true },
      });

      console.log("✅ User upgraded:", email);
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response("Invalid signature", { status: 400 });
  }
}
