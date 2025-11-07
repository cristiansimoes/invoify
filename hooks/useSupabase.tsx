import z from "zod";

import { InvoiceSchema } from "@/lib/schemas";
import { supabase } from "@/lib/supabaseClient";
import { InvoiceType } from "@/types";

export type InvoiceTypeReturnDb = {
    id_user: string;
    invoice_number: string;
    total_amount: number;
    currency: string;
    data: InvoiceType;
};

const useSupabase = () => {
    async function saveInvoiceDb(invoice: InvoiceType, userId: string) {
        const parsed = invoice;

        const { data, error } = await supabase.from("invoices").insert([
            {
                id_user: userId,
                invoice_number: parsed.details.invoiceNumber,
                total_amount: parsed.details.totalAmount,
                currency: parsed.details.currency,
                data: parsed,
            },
        ]);

        if (error) {
            console.error("Error inserting invoice:", error);
            throw error;
        }

        return data;
    }

    async function getAllInvoicesFromIdDb(userId: string) {
        const { data, error } = await supabase
            .from("invoices")
            .select("*")
            .eq("id_user", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error getting invoice:", error);
            throw error;
        }

        return data as Array<InvoiceTypeReturnDb>;
    }

    async function updateInvoiceDb(
        updatedInvoice: z.infer<typeof InvoiceSchema>,
        invoiceId: string,
        userId: string
    ) {
        const { data, error } = await supabase
            .from("invoices")
            .update({
                data: updatedInvoice,
                total_amount: updatedInvoice.details.totalAmount,
                updated_at: new Date().toISOString(),
            })
            .eq("id", invoiceId)
            .eq("id_user", userId);

        if (error) {
            console.error("Error getting invoice:", error);
            throw error;
        }

        return data;
    }

    return {
        saveInvoiceDb,
        getAllInvoicesFromIdDb,
        updateInvoiceDb,
    };
};

export default useSupabase;
