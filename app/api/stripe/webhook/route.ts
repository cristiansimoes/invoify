import Stripe from "stripe";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const email = session.customer_details?.email;

      if (email) {
        // Buscar usuário pelo email no Clerk
        const { data: users } = await clerkClient.users.getUserList({
          emailAddress: [email],
        });

        if (users && users.length > 0) {
          await clerkClient.users.updateUser(users[0].id, {
            publicMetadata: { isPaid: true },
          });

          console.log("✅ USER UPGRADED TO PRO:", email);
        } else {
          console.log("⚠️ Email not found in Clerk:", email);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err?.message);
    return new Response("Webhook error", { status: 400 });
  }
}
