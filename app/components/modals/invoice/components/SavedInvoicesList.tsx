"use client";

import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { BaseButton } from "@/app/components";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { formatNumberWithCommas } from "@/lib/helpers";

import { InvoiceType } from "@/types";
import { useUser } from "@clerk/nextjs";
import useSupabase from "@/hooks/useSupabase";
import { useRouter } from "next/navigation";

type SavedInvoicesListProps = {
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
};

const SavedInvoicesList = ({ setModalState }: SavedInvoicesListProps) => {
  const { 
    // onFormSubmit, deleteInvoiceById, 
    downloadPdf, generatePdf } = useInvoiceContext();
  const { reset } = useFormContext<InvoiceType>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
    const [invoicesListDb, setInvoicesListDb] = useState([]);
    const {user} = useUser()
  const {getAllInvoicesFromIdDb, deleteInvoiceDb} = useSupabase()

  const getAllInvoicesById = async () => {
        setLoading(true);
        try {
            const list = await getAllInvoicesFromIdDb(user?.id ?? 'ß');
            setInvoicesListDb(list);
        } finally {
            setLoading(false);
        }
      };
  
       useEffect(() => {
              if (user?.id) {
                getAllInvoicesById();
              }
          }, [user?.id]);

  // ✅ Corrige datas sem quebrar o tipo (usando "as any")
  const prepareInvoiceForLoad = (inv: InvoiceType) => {
    (inv.details as any).invoiceDate = new Date(inv.details.invoiceDate);
    (inv.details as any).dueDate = new Date(inv.details.dueDate);

    inv.details.invoiceLogo = "";
    inv.details.signature = { data: "" };
  };

  const load = (invoiceDTO: any) => {
    router.push(`/en/invoice/${invoiceDTO.id}`);
    setModalState(false);
  };

  const handleDownload = async (inv) => {
  const blob = await generatePdf(inv.data);
  return downloadPdf(blob)
};
  const loadAndGeneratePdf = async (invoiceDTO: any) => {
    await handleDownload(invoiceDTO)
    load(invoiceDTO);
    setModalState(false);
  };

  const handleDeleteInvoice = async (id) => {
      try {
        await deleteInvoiceDb(id, user?.id)
        getAllInvoicesById()
      } catch (err) {
        console.error(err)
      }
    }

  return (
    <div className="flex flex-col gap-5 overflow-y-auto max-h-72">
      {invoicesListDb.map((invoice) => {
        const d = invoice.data;
        const sender = d?.sender?.name || d?.from?.name || "Unknown";
        const receiver = d?.billTo?.name || d?.receiver?.name || "Unknown";

        return (
          <Card
            key={invoice.id}
            className="p-2 border rounded-sm hover:border-blue-500 hover:shadow-lg cursor-pointer"
          >
            <CardContent className="flex justify-between">
              <div>
                <p className="font-semibold">Invoice #{invoice.invoice_number}</p>

                <small className="text-gray-500">
                  Date: {new Date(d.invoiceDate).toLocaleDateString()}
                </small>

                <div className="mt-2">
                  <p>Sender: {invoice.data.sender.name}</p>
                  <p>Receiver: {invoice.data.receiver.name}</p>

                  <p>
                    Total:{" "}
                    <span className="font-semibold">
                      {formatNumberWithCommas(Number(invoice.total_amount))} USD
                    </span>
                  </p>

                  <p>
                    Status:{" "}
                    {invoice.status === "paid" ? "✅ Paid" : "⭕ Unpaid"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <BaseButton
                  tooltipLabel="Load invoice into the form"
                  variant="outline"
                  size="sm"
                  onClick={() => load(invoice)}
                >
                  Load
                </BaseButton>

                <BaseButton
                  tooltipLabel="Load invoice and generate PDF"
                  variant="outline"
                  size="sm"
                  onClick={() => loadAndGeneratePdf(invoice)}
                >
                  Load & Generate
                </BaseButton>

                <BaseButton
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteInvoice(invoice.id);
                  }}
                >
                  Delete
                </BaseButton>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {invoicesListDb.length === 0 && (
        <div>
          <p>No saved invoices</p>
        </div>
      )}
    </div>
  );
};

export default SavedInvoicesList;
