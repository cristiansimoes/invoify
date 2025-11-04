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
    return (
      <div style={{ textAlign: "center", padding: 40, maxWidth: 480, margin: "80px auto" }}>
        <h2 style={{ fontSize: 26, marginBottom: 10 }}>🚀 Your free invoice is over</h2>
        <p style={{ marginBottom: 20 }}>Upgrade to generate unlimited invoices.</p>

        <a
          href={STRIPE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "12px 20px",
            background: "#0070f3",
            color: "#fff",
            borderRadius: 8,
            display: "inline-block",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Subscribe
        </a>

        <p style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
          After payment, refresh the page. (MVP)
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
