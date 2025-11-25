"use client";

// React
import { useEffect } from "react";

// RHF
import { useFormContext } from "react-hook-form";

// ShadCn
import { Form } from "@/components/ui/form";

// Components
import { InvoiceActions, InvoiceForm } from "@/app/components";

// Context
import { useInvoiceContext } from "@/contexts/InvoiceContext";

// Types
import { InvoiceType } from "@/types";
import { useParams } from "next/navigation";

const InvoiceMain = ({edit = false}: {edit?: boolean}) => {
  const { handleSubmit, reset } = useFormContext<InvoiceType>();

  // Get the needed values from invoice context
  const { onFormSubmit } = useInvoiceContext();
  
  const {id} = useParams();

  // ✅ Listen for load invoice event (for View/Edit)
  useEffect(() => {
    const handler = (event: any) => {
      reset(event.detail); // Preenche formulário com a invoice selecionada
    };

    window.addEventListener("loadInvoiceForEdit", handler);
    return () => window.removeEventListener("loadInvoiceForEdit", handler);
  }, [reset]);

  return (
    <>
      <Form {...useFormContext<InvoiceType>()}>
        <form
          onSubmit={handleSubmit((data) => onFormSubmit(data, edit, id as string), (err) => {
            console.log(err);
          })}
        >
          <div className="flex flex-wrap">
            <InvoiceForm />
            <InvoiceActions />
          </div>
        </form>
      </Form>
    </>
  );
};

export default InvoiceMain;
