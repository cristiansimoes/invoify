import Stripe from "stripe";
import { getClerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const head = await headers();
  const signature = head.get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const email = session.customer_details?.email;

      if (!email) {
        console.log("⚠️ No email from Stripe session");
        return new Response("ok", { status: 200 });
      }

      const clerk = await getClerkClient();
      const users = await clerk.users.getUserList({
        emailAddress: [email],
      });

      if (users.length > 0) {
        await clerk.users.updateUser(users[0].id, {
          publicMetadata: { isPaid: true },
        });

        console.log("✅ User upgraded:", email);
      } else {
        console.log("⚠️ User not found in Clerk:", email);
      }
    }

    return new Response("OK", { status: 200 });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response("Webhook error", { status: 400 });
  }
}
