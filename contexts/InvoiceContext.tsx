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

// Clerk ✅
import { useUser } from "@clerk/nextjs";

// RHF
import { useFormContext } from "react-hook-form";

// Hooks
import useToasts from "@/hooks/useToasts";

// Services
import { exportInvoice } from "@/services/invoice/client/exportInvoice";

// Variables
import {
  FORM_DEFAULT_VALUES,
  GENERATE_PDF_API,
  SEND_PDF_API,
  SHORT_DATE_OPTIONS,
  LOCAL_STORAGE_INVOICE_DRAFT_KEY,
} from "@/lib/variables";

// Types
import { ExportTypes, InvoiceType } from "@/types";

const defaultInvoiceContext = {
  invoicePdf: new Blob(),
  invoicePdfLoading: false,
  savedInvoices: [] as InvoiceType[],
  pdfUrl: null as string | null,
  onFormSubmit: (values: InvoiceType) => {},
  newInvoice: () => {},
  generatePdf: async (data: InvoiceType) => {},
  removeFinalPdf: () => {},
  downloadPdf: () => {},
  printPdf: () => {},
  previewPdfInTab: () => {},
  saveInvoice: () => {},
  deleteInvoice: (index: number) => {},
  sendPdfToMail: (email: string): Promise<void> => Promise.resolve(),
  exportInvoiceAs: (exportAs: ExportTypes) => {},
  importInvoice: (file: File) => {},
};

export const InvoiceContext = createContext(defaultInvoiceContext);

export const useInvoiceContext = () => {
  return useContext(InvoiceContext);
};

type InvoiceContextProviderProps = {
  children: React.ReactNode;
};

export const InvoiceContextProvider = ({
  children,
}: InvoiceContextProviderProps) => {
  const router = useRouter();
  const { user } = useUser(); // ✅ pega usuário do Clerk

  // Toasts
  const {
    newInvoiceSuccess,
    pdfGenerationSuccess,
    saveInvoiceSuccess,
    modifiedInvoiceSuccess,
    sendPdfSuccess,
    sendPdfError,
    importInvoiceError,
  } = useToasts();

  const { getValues, reset, watch } = useFormContext<InvoiceType>();

  const [invoicePdf, setInvoicePdf] = useState<Blob>(new Blob());
  const [invoicePdfLoading, setInvoicePdfLoading] = useState<boolean>(false);

  const [savedInvoices, setSavedInvoices] = useState<InvoiceType[]>([]);

  useEffect(() => {
    let savedInvoicesDefault;
    if (typeof window !== undefined) {
      const savedInvoicesJSON = window.localStorage.getItem("savedInvoices");
      savedInvoicesDefault = savedInvoicesJSON
        ? JSON.parse(savedInvoicesJSON)
        : [];
      setSavedInvoices(savedInvoicesDefault);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const subscription = watch((value) => {
      try {
        window.localStorage.setItem(
          LOCAL_STORAGE_INVOICE_DRAFT_KEY,
          JSON.stringify(value)
        );
      } catch {}
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const pdfUrl = useMemo(() => {
    if (invoicePdf.size > 0) {
      return window.URL.createObjectURL(invoicePdf);
    }
    return null;
  }, [invoicePdf]);

  // ✅ PAGAMENTO + 1 Invoice grátis
  const onFormSubmit = (data: InvoiceType) => {
    const isPaid = user?.publicMetadata?.isPaid === true;
    const count = Number(localStorage.getItem("invoice_count") || 0);

    if (!isPaid && count >= 1) {
      alert("🎉 Você já usou sua invoice gratuita! Assine para gerar mais.");
      return;
    }

    localStorage.setItem("invoice_count", String(count + 1));

    generatePdf(data);
  };

  const newInvoice = () => {
    reset(FORM_DEFAULT_VALUES);
    setInvoicePdf(new Blob());

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(LOCAL_STORAGE_INVOICE_DRAFT_KEY);
      } catch {}
    }

    router.refresh();
    newInvoiceSuccess();
  };

  const generatePdf = useCallback(async (data: InvoiceType) => {
    setInvoicePdfLoading(true);

    try {
      const response = await fetch(GENERATE_PDF_API, {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.blob();
      setInvoicePdf(result);

      if (result.size > 0) {
        pdfGenerationSuccess();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setInvoicePdfLoading(false);
    }
  }, []);

  const removeFinalPdf = () => {
    setInvoicePdf(new Blob());
  };

  const previewPdfInTab = () => {
    if (invoicePdf) {
      const url = window.URL.createObjectURL(invoicePdf);
      window.open(url, "_blank");
    }
  };

  const downloadPdf = () => {
    if (invoicePdf instanceof Blob && invoicePdf.size > 0) {
      const url = window.URL.createObjectURL(invoicePdf);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const printPdf = () => {
    if (invoicePdf) {
      const pdfUrl = URL.createObjectURL(invoicePdf);
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const saveInvoice = () => {
    if (invoicePdf) {
      if (getValues) {
        const savedInvoicesJSON = localStorage.getItem("savedInvoices");
        const savedInvoices = savedInvoicesJSON
          ? JSON.parse(savedInvoicesJSON)
          : [];

        const updatedDate = new Date().toLocaleDateString(
          "en-US",
          SHORT_DATE_OPTIONS
        );

        const formValues = getValues();
        formValues.details.updatedAt = updatedDate;

        const existingInvoiceIndex = savedInvoices.findIndex(
          (invoice: InvoiceType) => {
            return (
              invoice.details.invoiceNumber === formValues.details.invoiceNumber
            );
          }
        );

        if (existingInvoiceIndex !== -1) {
          savedInvoices[existingInvoiceIndex] = formValues;
          modifiedInvoiceSuccess();
        } else {
          savedInvoices.push(formValues);
          saveInvoiceSuccess();
        }

        localStorage.setItem("savedInvoices", JSON.stringify(savedInvoices));

        setSavedInvoices(savedInvoices);
      }
    }
  };

  const deleteInvoice = (index: number) => {
    if (index >= 0 && index < savedInvoices.length) {
      const updatedInvoices = [...savedInvoices];
      updatedInvoices.splice(index, 1);
      setSavedInvoices(updatedInvoices);

      const updatedInvoicesJSON = JSON.stringify(updatedInvoices);
      localStorage.setItem("savedInvoices", updatedInvoicesJSON);
    }
  };

  const sendPdfToMail = (email: string) => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("invoicePdf", invoicePdf, "invoice.pdf");
    fd.append("invoiceNumber", getValues().details.invoiceNumber);

    return fetch(SEND_PDF_API, {
      method: "POST",
      body: fd,
    })
      .then((res) => {
        if (res.ok) {
          sendPdfSuccess();
        } else {
          sendPdfError({ email, sendPdfToMail });
        }
      })
      .catch((error) => {
        console.log(error);
        sendPdfError({ email, sendPdfToMail });
      });
  };

  const exportInvoiceAs = (exportAs: ExportTypes) => {
    const formValues = getValues();
    exportInvoice(exportAs, formValues);
  };

  const importInvoice = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);

        if (importedData.details) {
          if (importedData.details.invoiceDate) {
            importedData.details.invoiceDate = new Date(
              importedData.details.invoiceDate
            );
          }
          if (importedData.details.dueDate) {
            importedData.details.dueDate = new Date(
              importedData.details.dueDate
            );
          }
        }

        reset(importedData);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        importInvoiceError();
      }
    };
    reader.readAsText(file);
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoicePdf,
        invoicePdfLoading,
        savedInvoices,
        pdfUrl,
        onFormSubmit,
        newInvoice,
        generatePdf,
        removeFinalPdf,
        downloadPdf,
        printPdf,
        previewPdfInTab,
        saveInvoice,
        deleteInvoice,
        sendPdfToMail,
        exportInvoiceAs,
        importInvoice,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
