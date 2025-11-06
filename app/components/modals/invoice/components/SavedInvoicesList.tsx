"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { BaseButton } from "@/app/components";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { formatNumberWithCommas } from "@/lib/helpers";

import { InvoiceType } from "@/types";

type SavedInvoicesListProps = {
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
};

const SavedInvoicesList = ({ setModalState }: SavedInvoicesListProps) => {
  const { savedInvoices, onFormSubmit, deleteInvoiceById } = useInvoiceContext();
  const { reset } = useFormContext<InvoiceType>();

  // ✅ Corrige datas sem quebrar o tipo (usando "as any")
  const prepareInvoiceForLoad = (inv: InvoiceType) => {
    (inv.details as any).invoiceDate = new Date(inv.details.invoiceDate);
    (inv.details as any).dueDate = new Date(inv.details.dueDate);

    inv.details.invoiceLogo = "";
    inv.details.signature = { data: "" };
  };

  const load = (invoiceDTO: any) => {
    const selected = invoiceDTO.data;
    if (!selected) return;

    prepareInvoiceForLoad(selected);
    reset(selected);
    setModalState(false);
  };

  const loadAndGeneratePdf = (invoiceDTO: any) => {
    load(invoiceDTO);
    onFormSubmit(invoiceDTO.data);
  };

  return (
    <div className="flex flex-col gap-5 overflow-y-auto max-h-72">
      {savedInvoices.map((invoice) => {
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
                <p className="font-semibold">Invoice #{invoice.id}</p>

                <small className="text-gray-500">
                  Date: {new Date(invoice.issueDate).toLocaleDateString()}
                </small>

                <div className="mt-2">
                  <p>Sender: {sender}</p>
                  <p>Receiver: {receiver}</p>

                  <p>
                    Total:{" "}
                    <span className="font-semibold">
                      {formatNumberWithCommas(Number(invoice.total))} USD
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
                    deleteInvoiceById(invoice.id);
                  }}
                >
                  Delete
                </BaseButton>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {savedInvoices.length === 0 && (
        <div>
          <p>No saved invoices</p>
        </div>
      )}
    </div>
  );
};

export default SavedInvoicesList;
