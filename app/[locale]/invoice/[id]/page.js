"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import InvoiceMain from "@/app/components/invoice/InvoiceMain";

export default function InvoiceViewEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loadInvoiceById, reset } = useInvoiceContext();

  useEffect(() => {
    if (!id) return;

    const invoice = loadInvoiceById(id);

    if (!invoice) {
      alert("Invoice not found!");
      router.push("/en/dashboard");
      return;
    }

    // ✅ carrega os dados dentro do form
    reset(invoice.data);
  }, [id]);

  return (
    <main className="container mx-auto py-6">
      <h2 className="text-xl font-bold mb-4">Edit Invoice #{id}</h2>
      <InvoiceMain />
    </main>
  );
}
