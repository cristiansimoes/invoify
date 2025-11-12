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
    created_at: string;
    id: string;
    status: string;
    updated_at: string;
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

    async function getInvoiceByIdDb(invoiceId: string, userId: string) {
        const { data, error } = await supabase
            .from("invoices")
            .select("*")
            .eq("id", invoiceId)
            .eq("id_user", userId)
            .single(); // ensures you get one object instead of an array
        // If you only need certain fields (for example, for a preview list or dashboard), add:
        // .select("id, invoice_number, total_amount, currency, status, created_at")

        if (error) {
            console.error("Error fetching invoice:", error);
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
        updatedInvoice: InvoiceTypeReturnDb,
        status: string,
        invoiceId: string,
        userId: string
    ) {
        const { data, error } = await supabase
            .from("invoices")
            .update({
                data: updatedInvoice.data,
                total_amount: updatedInvoice.total_amount,
                updated_at: new Date().toISOString(),
                id_user: userId,
                invoice_number: updatedInvoice.invoice_number,
                currency: updatedInvoice.currency,
                status,
            })
            .eq("id", invoiceId)
            .eq("id_user", userId);

        if (error) {
            console.error("Error getting invoice:", error);
            throw error;
        }

        return data;
    }

    async function deleteInvoiceDb(invoiceId: string, userId: string) {
        const { error } = await supabase
            .from("invoices")
            .delete()
            .eq("id", invoiceId)
            .eq("id_user", userId);

        if (error) {
            console.error("Error deleting invoice:", error);
            throw error;
        }

        return true;
    }

    // Get paid_revenue, unpaid_revenue, and total_revenue
    async function getSummaryDashboard(userId: string) {
        const { data, error } = await supabase
            .from("v_invoice_summary_with_change")
            .select("*")
            .eq("id_user", userId)
            .order("month", { ascending: false })
            .limit(1);

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
        getSummaryDashboard,
        deleteInvoiceDb,
        getInvoiceByIdDb,
    };
};

export default useSupabase;
