// lib/invoices-local.ts

export type InvoiceLine = {
  item: string;
  qty: number;
  rate: number;
  amount: number;
};

export type InvoiceDTO = {
  id: string;
  customerName: string;
  total: number;
  issueDate: string;
  dueDate?: string;
  status?: "paid" | "unpaid";
  data: any;
};

const STORAGE_KEY = "ff_invoices";

function readAll(): InvoiceDTO[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InvoiceDTO[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: InvoiceDTO[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ✅ Util: calcula total com fallback p/ formatos antigos
function calcItemsTotal(data: any) {
  const items =
    data?.details?.items ||
    data?.items ||
    data?.lineItems ||
    data?.products ||
    [];

  return items.reduce((sum: number, item: any) => {
    const qty = Number(item.quantity ?? item.qty ?? 0);
    const rate = Number(item.unitPrice ?? item.price ?? item.rate ?? 0);
    const amount = Number(item.total ?? qty * rate);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
}

// ✅ Salva — SEM perder status nem data
export function saveInvoiceLocal(inv: InvoiceDTO) {
  const list = readAll();

  const existing = list.find((i) => i.id === inv.id);

  // Se já existir, mescla
  const merged = existing
    ? {
        ...existing,
        ...inv,
        data: inv.data ?? existing.data,
        status: inv.status ?? existing.status ?? "unpaid",
        total: calcItemsTotal(inv.data ?? existing.data),
      }
    : {
        ...inv,
        status: inv.status ?? "unpaid",
        total: calcItemsTotal(inv.data),
      };

  const updated = existing
    ? list.map((i) => (i.id === inv.id ? merged : i))
    : [merged, ...list];

  writeAll(updated);
}

// ✅ Lê tudo e garante consistência
export function getInvoicesLocal(): InvoiceDTO[] {
  return readAll().map((inv) => ({
    ...inv,
    total: calcItemsTotal(inv.data ?? {}),
    status: inv.status ?? "unpaid",
  }));
}

export function getInvoiceByIdLocal(id: string): InvoiceDTO | undefined {
  return readAll().find((x) => x.id === id);
}

export function deleteInvoiceLocal(id: string) {
  const cleaned = readAll().filter((x) => x.id !== id);
  writeAll(cleaned);
}
