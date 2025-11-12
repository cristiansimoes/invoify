"use client";

import { useEffect, useState } from "react";

// ShadCn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Components
import { SavedInvoicesList } from "@/app/components";
import { ImportJsonButton } from "@/app/components";

// Context
import useSupabase from "@/hooks/useSupabase";
import { useUser } from "@clerk/nextjs";

type InvoiceLoaderModalType = {
  children: React.ReactNode;
};

const InvoiceLoaderModal = ({ children }: InvoiceLoaderModalType) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoicesListDb, setInvoicesListDb] = useState([]);

  const {user} = useUser()
  const {getAllInvoicesFromIdDb} = useSupabase()

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader className="pb-2 border-b">
          <DialogTitle>Saved Invoices</DialogTitle>
          <DialogDescription>
            <div className="space-y-2">
              {!loading && !!invoicesListDb.length && <span>You have {invoicesListDb?.length} saved invoices</span>}
              <ImportJsonButton setOpen={setOpen}/>
            </div>
          </DialogDescription>
        </DialogHeader>

        {!loading && !!invoicesListDb.length && <SavedInvoicesList setModalState={setOpen} />}
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceLoaderModal;
