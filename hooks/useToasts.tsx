// ShadCn
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";

const useToasts = () => {
    type SendErrorType = {
        email: string;
        sendPdfToMail: (email: string) => void;
    };

    const newInvoiceSuccess = () => {
        toast({
            variant: "default",
            title: "New invoice created ✅",
            description: "Start customizing it now.",
        });
    };

    const pdfGenerationSuccess = () => {
        toast({
            variant: "default",
            title: "Invoice ready ✨",
            description: "Click the PDF button again to download your file.",
        });
    };

    const saveInvoiceSuccess = () => {
        toast({
            variant: "default",
            title: "Invoice saved 💾",
            description: "Your invoice has been saved.",
        });
    };

    const modifiedInvoiceSuccess = () => {
        toast({
            variant: "default",
            title: "Invoice updated ✅",
            description: "Changes have been saved.",
        });
    };

    const sendPdfSuccess = () => {
        toast({
            variant: "default",
            title: "Sent! 📤",
            description: "Your invoice was emailed successfully.",
        });
    };

    const sendPdfError = ({ email, sendPdfToMail }: SendErrorType) => {
        toast({
            variant: "destructive",
            title: "Email failed ❌",
            description: "Something went wrong. Try again.",
            action: (
                <ToastAction
                    onClick={() => sendPdfToMail(email)}
                    altText="Try again"
                >
                    Try again
                </ToastAction>
            ),
        });
    };

    const importInvoiceError = () => {
        toast({
            variant: "destructive",
            title: "Import failed ❌",
            description: "Make sure the file is a valid FlukeFlow JSON export.",
        });
    };

    return {
        newInvoiceSuccess,
        pdfGenerationSuccess,
        saveInvoiceSuccess,
        modifiedInvoiceSuccess,
        sendPdfSuccess,
        sendPdfError,
        importInvoiceError,
    };
};

export default useToasts;
