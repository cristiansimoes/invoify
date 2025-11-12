"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import InvoiceMain from "@/app/components/invoice/InvoiceMain";
import useSupabase from "@/hooks/useSupabase";
import { useUser } from "@clerk/nextjs";

export default function InvoiceViewEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const {
        // loadInvoiceById,
        reset,
    } = useInvoiceContext();
    const { user } = useUser();
    const { getInvoiceByIdDb } = useSupabase();
    const [invoiceDetails, setInvoiceDetails] = useState();

    const prepareInvoiceForLoad = (inv) => {
        inv.details.invoiceDate = new Date(inv.details.invoiceDate);
        inv.details.dueDate = new Date(inv.details.dueDate);

        inv.details.invoiceLogo = "";
        inv.details.signature = { data: "" };
    };
    const handleGetInvoiceById = async () => {
        // setLoading(true);
        try {
            const res = await getInvoiceByIdDb(id, user?.id);
            console.log(res);
            const selected = res.data;
            if (!selected) return;

            prepareInvoiceForLoad(selected);
            reset(selected);
            setInvoiceDetails(res);
        } catch (e) {
            console.error(e);
            alert("Invoice not found!");
            router.push("/en/dashboard");
        }
    };

    useEffect(() => {
        if (!id && !user?.id) return;

        if (id && user?.id) handleGetInvoiceById();
    }, [id, user?.id]);

    // TODO: put a loading here
    return (
        <main className="container mx-auto py-6">
            <h2 className="text-xl font-bold mb-4">
                Edit Invoice #{invoiceDetails?.invoice_number ?? "-"}
            </h2>
            {!!invoiceDetails && <InvoiceMain />}
        </main>
    );
}
