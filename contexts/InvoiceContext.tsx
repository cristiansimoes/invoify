"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useFormContext } from "react-hook-form";

import useToasts from "@/hooks/useToasts";
import useSupabase from "@/hooks/useSupabase";
import { exportInvoice } from "@/services/invoice/client/exportInvoice";

import {
  FORM_DEFAULT_VALUES,
  GENERATE_PDF_API,
  SEND_PDF_API,
  LOCAL_STORAGE_INVOICE_DRAFT_KEY,
} from "@/lib/variables";

import {
  saveInvoiceLocal,
  getInvoicesLocal,
  getInvoiceByIdLocal,
  deleteInvoiceLocal,
  type InvoiceDTO,
} from "@/lib/invoices-local";

import type { ExportTypes, InvoiceType } from "@/types";

type Ctx = {
  invoicePdf: Blob;
  invoicePdfLoading: boolean;
  pdfUrl: string | null;
  savedInvoices: InvoiceDTO[];
  onFormSubmit: (values: InvoiceType) => void;
  newInvoice: () => void;
  generatePdf: (data: InvoiceType) => Promise<Blob | undefined>;
  removeFinalPdf: () => void;
  downloadPdf: (blob?: Blob) => void;
  printPdf: () => void;
  previewPdfInTab: () => void;
  saveInvoice: () => void;
  deleteInvoiceById: (id: string | number) => void;
  sendPdfToMail: (email: string) => Promise<void>;
  exportInvoiceAs: (as: ExportTypes) => void;
  importInvoice: (file: File) => void;
  loadInvoiceById: (id: string | number) => InvoiceDTO | undefined;
  reset: (data: InvoiceType) => void;
  markInvoicePaid: (id: string | number) => void;
  markInvoiceUnpaid: (id: string | number) => void; // 👈 novo
};

const defaultCtx = {} as Ctx;
export const InvoiceContext = createContext(defaultCtx);
export const useInvoiceContext = () => useContext(InvoiceContext);

export const InvoiceContextProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user } = useUser();
  const { getValues, reset, watch } = useFormContext<InvoiceType>();
  const [invoicePdf, setInvoicePdf] = useState<Blob>(new Blob());
  const [invoicePdfLoading, setInvoicePdfLoading] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceDTO[]>([]);

  const {
    newInvoiceSuccess,
    pdfGenerationSuccess,
    saveInvoiceSuccess,
    modifiedInvoiceSuccess,
    sendPdfSuccess,
    sendPdfError,
    importInvoiceError,
  } = useToasts();
  const { saveInvoiceDb } = useSupabase()

  /** ---- helpers ---- */
  const extractItems = (data: any) => {
    if (data?.details?.items) return data.details.items; // seu schema atual
    return data?.items || data?.lineItems || data?.products || []; // fallbacks
  };

  const calcTotal = (data: any) => {
    const items = extractItems(data);
    return items.reduce((acc: number, it: any) => {
      const qty = Number(it.quantity ?? it.qty ?? 0);
      const rate = Number(it.unitPrice ?? it.price ?? it.rate ?? 0);
      const amount = Number(it.total ?? qty * rate);
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const buildDTO = (d: InvoiceType): InvoiceDTO => {
    const anyd: any = d;
    return {
      id: String(anyd.details?.invoiceNumber || "00001"),
      // usa receiver.name como padrão (combina com o JSON que você mostrou),
      // com fallbacks para outros possíveis campos
      customerName:
        anyd.receiver?.name ||
        anyd.billTo?.name ||
        anyd.client?.name ||
        anyd.customer?.name ||
        "Client",
      total: calcTotal(anyd),
      issueDate:
        anyd.details?.invoiceDate || new Date().toISOString().slice(0, 10),
      dueDate: anyd.details?.dueDate,
      status: "unpaid",
      data: d,
    };
  };

  /** Rehidrata e normaliza tudo ao montar */
  useEffect(() => {
    try {
      const list = getInvoicesLocal();
      const fixed = list.map((inv) => {
        const newTotal = Number(calcTotal(inv.data));
        return {
          ...inv,
          total: Number.isFinite(newTotal) ? newTotal : Number(inv.total) || 0,
          status: (inv.status ?? "unpaid") as "paid" | "unpaid",
        };
      });
      setSavedInvoices(fixed);
    } catch {
      setSavedInvoices([]);
    }
  }, []);

  /** Auto-draft */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sub = watch((value) => {
      localStorage.setItem(
        LOCAL_STORAGE_INVOICE_DRAFT_KEY,
        JSON.stringify(value)
      );
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const pdfUrl = useMemo(
    () => (invoicePdf.size > 0 ? URL.createObjectURL(invoicePdf) : null),
    [invoicePdf]
  );


  /** Submit (nova invoice) */
  const onFormSubmit = async (data: InvoiceType) => {console.log('>')
    const isPaid = user?.publicMetadata?.isPaid === true;
    const count = Number(localStorage.getItem("invoice_count") || 0);
    
    if (!isPaid && count >= 1) {
      alert("🎉 You used your free invoice! Upgrade to continue.");
      return;
    }
    
    const userId = user?.id ?? "";
    await saveInvoiceDb(data, userId)
    localStorage.setItem("invoice_count", String(count + 1));

    const dto = buildDTO(data);
    saveInvoiceLocal(dto);
    setSavedInvoices(getInvoicesLocal());
    saveInvoiceSuccess();
    generatePdf(data);
  };

  const newInvoice = () => {
    reset(FORM_DEFAULT_VALUES);
    setInvoicePdf(new Blob());
    localStorage.removeItem(LOCAL_STORAGE_INVOICE_DRAFT_KEY);
    router.refresh();
    newInvoiceSuccess();
  };

  const generatePdf = useCallback(async (data: InvoiceType) => {
    setInvoicePdfLoading(true);
    try {
      const res = await fetch(GENERATE_PDF_API, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const blob = await res.blob();
      setInvoicePdf(blob);
      if (blob.size > 0) {pdfGenerationSuccess();
        return blob
      }
    } finally {
      setInvoicePdfLoading(false);
    }
  }, []);

  const previewPdfInTab = () => {
    if (invoicePdf.size > 0) window.open(URL.createObjectURL(invoicePdf), "_blank");
  };

  const downloadPdf = (blob?: Blob) => {
    if (invoicePdf.size === 0 && !blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob ?? invoicePdf);
    a.download = "invoice.pdf";
    a.click();
  };

  const printPdf = () => {
    if (invoicePdf.size === 0) return;
    const win = window.open(URL.createObjectURL(invoicePdf), "_blank");
    win?.addEventListener("load", () => win.print());
  };

  /** Save (edição) — preserva status existente */
  const saveInvoice = () => {
    const data = getValues();
    const id = String((data as any)?.details?.invoiceNumber);
    const existing = id ? getInvoiceByIdLocal(id) : undefined;

    const dto: InvoiceDTO = existing
      ? {
          ...existing,
          data,
          total: calcTotal(data),
          // preserva status anterior
          status: (existing.status ?? "unpaid") as "paid" | "unpaid",
        }
      : buildDTO(data);

    saveInvoiceLocal(dto);
    setSavedInvoices(getInvoicesLocal());
    modifiedInvoiceSuccess();
  };

  /** Mark as Paid — altera só o status, não mexe no total/data */
  const markInvoicePaid = (id: string | number) => {
    const inv = getInvoiceByIdLocal(String(id));
    if (!inv) return;
    const updated: InvoiceDTO = { ...inv, status: "paid" };
    saveInvoiceLocal(updated);
    setSavedInvoices(getInvoicesLocal());
  };

    const markInvoiceUnpaid = (id: string | number) => {
    const inv = getInvoiceByIdLocal(String(id));
    if (!inv) return;

    const updated: InvoiceDTO = { ...inv, status: "unpaid" };
    saveInvoiceLocal(updated);
    setSavedInvoices(getInvoicesLocal());
  };


  const deleteInvoiceById = (id: string | number) => {
    deleteInvoiceLocal(String(id));
    setSavedInvoices(getInvoicesLocal());
  };

  const sendPdfToMail = async (email: string) => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("invoicePdf", invoicePdf, "invoice.pdf");
    fd.append("invoiceNumber", String(getValues().details.invoiceNumber));

    try {
      const res = await fetch(SEND_PDF_API, { method: "POST", body: fd });
      if (res.ok) sendPdfSuccess();
      else sendPdfError({ email, sendPdfToMail });
    } catch {
      sendPdfError({ email, sendPdfToMail });
    }
  };

  const exportInvoiceAs = (type: ExportTypes) => exportInvoice(type, getValues());

  const importInvoice = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        reset(data);
      } catch {
        importInvoiceError();
      }
    };
    reader.readAsText(file);
  };

  const loadInvoiceById = (id: string | number) => getInvoiceByIdLocal(String(id));

  return (
    <InvoiceContext.Provider
      value={{
        invoicePdf,
        invoicePdfLoading,
        pdfUrl,
        savedInvoices,
        onFormSubmit,
        newInvoice,
        generatePdf,
        removeFinalPdf: () => setInvoicePdf(new Blob()),
        downloadPdf,
        printPdf,
        previewPdfInTab,
        saveInvoice,
        deleteInvoiceById,
        sendPdfToMail,
        exportInvoiceAs,
        importInvoice,
        loadInvoiceById,
        reset,
        markInvoicePaid,
        markInvoiceUnpaid,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
