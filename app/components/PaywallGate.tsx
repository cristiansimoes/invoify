"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const STRIPE_URL = "https://buy.stripe.com/aFacN5f272qUdQM1Xa3Je01";
const FREE_INVOICE_LIMIT = 1;

interface PaywallGateProps {
  children: ReactNode;
}

export default function PaywallGate({ children }: PaywallGateProps) {
  const { user, isLoaded } = useUser();
  const [usedFreeInvoices, setUsedFreeInvoices] = useState(0);

  useEffect(() => {
    const count = Number(localStorage.getItem("invoice_count") || 0);
    setUsedFreeInvoices(count);
  }, []);

  if (!isLoaded) return null;

  const isPaid = user?.publicMetadata?.isPaid === true;
  const isBlocked = !isPaid && usedFreeInvoices >= FREE_INVOICE_LIMIT;

  if (isBlocked) {
    const uid = user?.id ?? "";
    const email = user?.primaryEmailAddress?.emailAddress ?? "";
    const checkoutUrl = `${STRIPE_URL}?client_reference_id=${encodeURIComponent(
      uid
    )}&prefilled_email=${encodeURIComponent(email)}`;

    return (
      <div style={{ textAlign: "center", padding: 40, maxWidth: 480, margin: "80px auto" }}>
        <h2 style={{ fontSize: 28, marginBottom: 12, fontWeight: 700 }}>
          🚀 Your free invoice is used up
        </h2>
        <p style={{ marginBottom: 20, fontSize: 16, opacity: 0.8 }}>
          Upgrade now to create unlimited invoices.
        </p>

        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "14px 22px",
            background: "#0070f3",
            color: "#fff",
            borderRadius: 10,
            display: "inline-block",
            fontSize: 17,
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          Upgrade — $19.90/month
        </a>

        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
          After subscribing, refresh the page to unlock features.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
