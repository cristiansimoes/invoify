import Stripe from "stripe";
import { headers } from "next/headers";
import { Clerk } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const email = session.customer_details?.email;

      console.log("✅ Stripe webhook: checkout session completed for", email);

      if (!email) {
        console.log("⚠️ No email received from Stripe");
        return new Response("OK");
      }

      // ✅ Find user in Clerk by email
      const users = await clerk.users.getUserList({ emailAddress: [email] });

      if (users.length > 0) {
        await clerk.users.updateUser(users[0].id, {
          publicMetadata: { isPaid: true },
        });

        console.log("🎉 User upgraded:", email);
      } else {
        console.log("⚠️ No Clerk user found for", email);
      }
    }

    return new Response("OK");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response("Webhook error", { status: 400 });
  }
}
