import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const head = headers();
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
        console.log("⚠️ No email returned from Stripe checkout");
        return new Response("OK");
      }

      // ✅ Buscar usuário no Clerk pelo email
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      });

      if (users.length > 0) {
        await clerkClient.users.updateUser(users[0].id, {
          publicMetadata: { isPaid: true },
        });

        console.log("✅ User upgraded:", email);
      } else {
        console.log("⚠️ No user found for email:", email);
      }
    }

    return new Response("OK");

  } catch (err) {
    console.error("❌ Stripe Webhook Error:", err);
    return new Response("Invalid signature", { status: 400 });
  }
}
