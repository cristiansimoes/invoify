"use client";

import InvoiceMain from "@/app/components/invoice/InvoiceMain";
import PaywallGate from "@/app/components/PaywallGate";

export default function InvoiceFormPage() {
  return (
    <PaywallGate>
      <main className="container mx-auto py-6">
        <InvoiceMain />
      </main>
    </PaywallGate>
  );
}
