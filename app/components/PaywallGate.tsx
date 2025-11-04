"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const STRIPE_URL = "https://buy.stripe.com/aFacN5f272qUdQM1Xa3Je01";

// Free invoices allowed before upgrade required
const FREE_INVOICE_LIMIT = 1;

export default function PaywallGate({ children }) {
  const { user, isLoaded } = useUser();
  const [usedFreeInvoices, setUsedFreeInvoices] = useState(0);

  useEffect(() => {
    const count = Number(localStorage.getItem("invoice_count") || 0);
    setUsedFreeInvoices(count);
  }, []);

  if (!isLoaded) return null;

  const isPaid = user?.publicMetadata?.isPaid === true;
  const exceededFreeLimit = !isPaid && usedFreeInvoices >= FREE_INVOICE_LIMIT;

  if (exceededFreeLimit) {
    return (
      <div style={{ textAlign: "center", padding: 40, maxWidth: 480, margin: "80px auto" }}>
        <h2 style={{ fontSize: 26, marginBottom: 10 }}>🚀 Free Invoice Used</h2>
        <p style={{ marginBottom: 20 }}>
          You have used your free invoice. Upgrade to continue creating invoices.
        </p>

        <button
          onClick={() => (window.location.href = STRIPE_URL)}
          style={{
            padding: "12px 20px",
            background: "#0070f3",
            color: "#fff",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Upgrade — R$ 19,90/month
        </button>

        <p style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
          After payment, refresh the page (MVP unlock).
        </p>
      </div>
    );
  }

  return children;
}
