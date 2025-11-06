"use client";

// ShadCn
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Components
import {
  PdfViewer,
  BaseButton,
  NewInvoiceAlert,
  InvoiceLoaderModal,
  InvoiceExportModal,
} from "@/app/components";

// Contexts
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useTranslationContext } from "@/contexts/TranslationContext";

// Icons
import { FileInput, FolderUp, Import, Plus, RotateCcw, Save } from "lucide-react";
import { useEffect } from "react";

const InvoiceActions = () => {
  const { invoicePdfLoading, newInvoice, saveInvoice, generatePdf } =
    useInvoiceContext();
  const { _t } = useTranslationContext();

  // ✅ Listener para PDF vindo do dashboard
  useEffect(() => {
  const handlePreview = (e: CustomEvent) => {
    const data = e?.detail;
    if (!data) return;
    generatePdf(data);
  };

  window.addEventListener("previewInvoicePdf", handlePreview as EventListener);
  return () =>
    window.removeEventListener("previewInvoicePdf", handlePreview as EventListener);
}, [generatePdf]);

  return (
    <div className="xl:w-[45%]">
      <Card className="h-auto sticky top-0 px-2">
        <CardHeader>
          <CardTitle>{_t("actions.title")}</CardTitle>
          <CardDescription>{_t("actions.description")}</CardDescription>
        </CardHeader>

        <div className="flex flex-col flex-wrap items-center gap-2">
          {/* Load + Export */}
          <div className="flex flex-wrap gap-3">
            <InvoiceLoaderModal>
              <BaseButton
                variant="outline"
                tooltipLabel="Open load invoice menu"
                disabled={invoicePdfLoading}
              >
                <FolderUp /> {_t("actions.loadInvoice")}
              </BaseButton>
            </InvoiceLoaderModal>

            <InvoiceExportModal>
              <BaseButton
                variant="outline"
                tooltipLabel="Open export invoice menu"
                disabled={invoicePdfLoading}
              >
                <Import /> {_t("actions.exportInvoice")}
              </BaseButton>
            </InvoiceExportModal>
          </div>

          {/* New / Reset / Generate / Save */}
          <div className="flex flex-wrap gap-3">
            <NewInvoiceAlert>
              <BaseButton
                variant="outline"
                tooltipLabel="Get a new invoice form"
                disabled={invoicePdfLoading}
              >
                <Plus /> {_t("actions.newInvoice")}
              </BaseButton>
            </NewInvoiceAlert>

            <NewInvoiceAlert
              title="Reset form?"
              description="This will clear all fields and the saved draft."
              confirmLabel="Reset"
              onConfirm={newInvoice}
            >
              <BaseButton
                variant="destructive"
                tooltipLabel="Reset entire form"
                disabled={invoicePdfLoading}
              >
                <RotateCcw /> Reset Form
              </BaseButton>
            </NewInvoiceAlert>

            <BaseButton
              type="submit"
              tooltipLabel="Generate your invoice"
              loading={invoicePdfLoading}
              loadingText="Generating your invoice"
            >
              <FileInput /> {_t("actions.generatePdf")}
            </BaseButton>

            <BaseButton
              variant="outline"
              tooltipLabel="Save this invoice"
              onClick={saveInvoice}
              disabled={invoicePdfLoading}
            >
              <Save /> Save Invoice
            </BaseButton>
          </div>

          {/* PDF Preview */}
          <div className="w-full">
            <PdfViewer />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceActions;
