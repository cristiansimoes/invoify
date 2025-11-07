"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileEdit,
  Trash2,
  Download,
  DollarSign,
  FileText,
  Layers,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

export default function DashboardPage() {
  const {
    savedInvoices,
    deleteInvoiceById,
    generatePdf,
    downloadPdf,
    loadInvoiceById,
    reset,
    invoicePdf,
    markInvoicePaid,
    markInvoiceUnpaid,
  } = useInvoiceContext();

  const [invoices, setInvoices] = useState([]);

  // ✅ Normalize invoices
  useEffect(() => {
    if (!savedInvoices) return;

    setInvoices(
      savedInvoices.map((inv) => ({
        ...inv,
        total: Number(inv.total || 0),
        status: inv.status || "unpaid",
      }))
    );
  }, [savedInvoices]);

  // ✅ Revenue totals
  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((a, b) => a + b.total, 0);

  const unpaidRevenue = invoices
    .filter((i) => i.status !== "paid")
    .reduce((a, b) => a + b.total, 0);

  const totalRevenue = paidRevenue + unpaidRevenue;

  // ✅ Monthly aggregation
  const monthlyMap = useMemo(() => {
    const map = new Map();

    invoices.forEach((inv) => {
      const key = getMonthKey(inv.issueDate);

      if (!map.has(key)) {
        map.set(key, { paid: 0, unpaid: 0 });
      }

      if (inv.status === "paid") map.get(key).paid += inv.total;
      else map.get(key).unpaid += inv.total;
    });

    return map;
  }, [invoices]);

  // ✅ Monthly comparison (%)
  const now = new Date();
  const thisKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const lastKey = `${now.getFullYear()}-${now.getMonth()}`;

  const thisMonthPaid = monthlyMap.get(thisKey)?.paid || 0;
  const lastMonthPaid = monthlyMap.get(lastKey)?.paid || 0;

  const thisMonthUnpaid = monthlyMap.get(thisKey)?.unpaid || 0;
  const lastMonthUnpaid = monthlyMap.get(lastKey)?.unpaid || 0;

  // ✅ Reusable delta calc (AGORA SEMPRE RETORNA NÚMERO)
  function calculateDelta(current, previous) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    const raw = ((current - previous) / previous) * 100;
    return Math.round(raw * 10) / 10; // garante número
  }

  const paidDelta = calculateDelta(thisMonthPaid, lastMonthPaid);
  const unpaidDelta = calculateDelta(thisMonthUnpaid, lastMonthUnpaid);

  // ✅ Professional renderDelta: with type ("paid" OR "unpaid")
  function renderDelta(delta, type) {
    delta = Number(delta); // ✅ garante número sempre

    let color = "text-gray-500";
    let Icon = Minus;

    if (type === "paid") {
      // Growth is GOOD
      if (delta > 0) {
        color = "text-green-600";
        Icon = ArrowUp;
      } else if (delta < 0) {
        color = "text-red-600";
        Icon = ArrowDown;
      }
    }

    if (type === "unpaid") {
      // Growth is BAD
      if (delta > 0) {
        color = "text-red-600";
        Icon = ArrowUp;
      } else if (delta < 0) {
        color = "text-green-600";
        Icon = ArrowDown;
      }
    }

    return (
      <span className={`flex items-center gap-1 text-sm ${color}`}>
        <Icon size={14} /> {delta}%
      </span>
    );
  }

  // ✅ Chart sorted
  const chartData = useMemo(() => {
    const arr = [];

    monthlyMap.forEach((value, key) => {
      const [year, month] = key.split("-");
      const date = new Date(year, Number(month) - 1);

      arr.push({
        sortKey: date.getTime(),
        name: date.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        paidRevenue: value.paid,
        unpaidRevenue: value.unpaid,
      });
    });

    arr.sort((a, b) => a.sortKey - b.sortKey);

    return arr.length
      ? arr
      : [{ name: "No Data", paidRevenue: 0, unpaidRevenue: 0 }];
  }, [monthlyMap]);

  // ✅ PDF
  const handleDownload = async (inv) => {
    const full = loadInvoiceById(inv.id);
    if (!full) return alert("Invoice not found");

    if (invoicePdf && invoicePdf.size > 0) return downloadPdf();

    reset(full.data);
    await generatePdf(full.data);
    alert("✅ PDF generated! Click again to download.");
  };

  // ✅ ✅ ✅ LAYOUT FINAL ✅ ✅ ✅
  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold mb-6">📊 Invoice Dashboard</h1>

      {/* ⭐ PREMIUM CARDS ROW ⭐ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Paid Revenue */}
        <Card className="shadow-sm hover:shadow-md transition border border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium">Paid Revenue</CardTitle>
            <DollarSign className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">${paidRevenue.toFixed(2)}</p>
            <div className="mt-1 opacity-80">{renderDelta(paidDelta, "paid")}</div>
          </CardContent>
        </Card>

        {/* Unpaid Revenue */}
        <Card className="shadow-sm hover:shadow-md transition border border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium">Unpaid Revenue</CardTitle>
            <FileText className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">${unpaidRevenue.toFixed(2)}</p>
            <div className="mt-1 opacity-80">{renderDelta(unpaidDelta, "unpaid")}</div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="shadow-sm hover:shadow-md transition border border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1 opacity-60">Sum of all invoices</p>
          </CardContent>
        </Card>

        {/* Total Invoices */}
        <Card className="shadow-sm hover:shadow-md transition border border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium">Total Invoices</CardTitle>
            <Layers className="h-6 w-6 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-700">{invoices.length}</p>
            <p className="text-sm text-gray-500 mt-1 opacity-60">Documents created</p>
          </CardContent>
        </Card>

      </div>

      {/* CHART */}
      <Card className="shadow-sm hover:shadow-md transition">
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="unpaidRevenue" stackId="rev" fill="#f59e0b" />
              <Bar dataKey="paidRevenue" stackId="rev" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* LIST */}
      {invoices.map((inv) => (
        <Card key={inv.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Invoice #{inv.id}</span>

              <div className="flex gap-2">
                {inv.status === "paid" ? (
                  <Button variant="outline" size="sm" onClick={() => markInvoiceUnpaid(inv.id)}>
                    ↩️ Unmark Paid
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => markInvoicePaid(inv.id)}>
                    ✅ Mark Paid
                  </Button>
                )}

                <Link href={`/en/invoice/${inv.id}`}>
                  <Button variant="outline" size="sm">
                    <FileEdit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </Link>

                <Button variant="outline" size="sm" onClick={() => handleDownload(inv)}>
                  <Download className="w-4 h-4 mr-1" /> PDF
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteInvoiceById(inv.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p><strong>Client:</strong> {inv.customerName}</p>
            <p><strong>Total:</strong> ${inv.total.toFixed(2)}</p>
            <p><strong>Date:</strong> {new Date(inv.issueDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {inv.status === "paid" ? "✅ Paid" : "⭕ Unpaid"}</p>
          </CardContent>
        </Card>
      ))}

    </div>
  );
}
