"use client";

import { InvoiceType } from "@/types";
import dynamic from "next/dynamic";
import { use } from "react";
import { useFormContext } from "react-hook-form";
import PaywallGate from "@/app/components/PaywallGate";

type ViewTemplatePageProps = {
  params: Promise<{ id: string }>;
};

const ViewTemplate = (props: ViewTemplatePageProps) => {
  const params = use(props.params);
  const templateNumber = params.id;

  const DynamicComponent = dynamic<InvoiceType>(() =>
    import(
      `@/app/components/templates/invoice-pdf/InvoiceTemplate${templateNumber}`
    )
  );

  const { getValues } = useFormContext();
  const formValues = getValues();

  return (
    <PaywallGate>
      <div className="container">
        <DynamicComponent
          sender={formValues.sender}
          receiver={formValues.receiver}
          details={formValues.details}
        />
      </div>
    </PaywallGate>
  );
};

export default ViewTemplate;
