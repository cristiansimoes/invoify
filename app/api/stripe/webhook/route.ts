import Stripe from "stripe";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

// util: acha usuário do Clerk por e-mail
async function findUserByEmail(email: string) {
  const { data: users } = await clerkClient.users.getUserList({
    emailAddress: [email],
  });
  return users?.[0];
}

// util: dado um customerId do Stripe, pega o e-mail do cliente
async function getEmailFromCustomerId(customerId: string) {
  const cust = await stripe.customers.retrieve(customerId);
  if (cust && !("deleted" in cust)) {
    return cust.email || null;
  }
  return null;
}

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

    switch (event.type) {
      // ✅ ASSINOU (ou iniciou trial): libera e salva o customerId
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // tenta o e-mail direto da sessão; se faltar, busca pelo customer
        let email =
          session.customer_details?.email ??
          (typeof session.customer === "string"
            ? await getEmailFromCustomerId(session.customer)
            : null);

        if (!email) {
          console.log("⚠️ checkout.completed sem e-mail");
          break;
        }

        const user = await findUserByEmail(email);
        if (!user) {
          console.log("⚠️ Clerk user não encontrado p/ email:", email);
          break;
        }

        // customerId usado depois p/ cancelar/falha
        const stripeCustomerId =
          typeof session.customer === "string"
            ? session.customer
            : (session.customer as any)?.id;

        await clerkClient.users.updateUser(user.id, {
          publicMetadata: { isPaid: true },
          privateMetadata: { stripeCustomerId },
        });

        console.log("✅ PRO liberado e customerId salvo:", email, stripeCustomerId);
        break;
      }

      // ❌ CANCELAMENTO: bloqueia
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const email = await getEmailFromCustomerId(customerId);
        if (!email) {
          console.log("⚠️ subscription.deleted sem email");
          break;
        }

        const user = await findUserByEmail(email);
        if (!user) {
          console.log("⚠️ Clerk user não encontrado p/ email:", email);
          break;
        }

        await clerkClient.users.updateUser(user.id, {
          publicMetadata: { isPaid: false },
        });

        console.log("✅ PRO bloqueado (cancelou):", email);
        break;
      }

      // ❌ PAGAMENTO FALHOU: bloqueia
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const email = await getEmailFromCustomerId(customerId);
        if (!email) {
          console.log("⚠️ payment_failed sem email");
          break;
        }

        const user = await findUserByEmail(email);
        if (!user) {
          console.log("⚠️ Clerk user não encontrado p/ email:", email);
          break;
        }

        await clerkClient.users.updateUser(user.id, {
          publicMetadata: { isPaid: false },
        });

        console.log("✅ PRO bloqueado (falha pagamento):", email);
        break;
      }

      default: {
        // Outros eventos você pode ignorar por enquanto
        // console.log("Evento ignorado:", event.type);
        break;
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message);
    return new Response("Webhook error", { status: 400 });
  }
}
