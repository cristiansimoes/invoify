"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, Trash2, Download } from "lucide-react";

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

  // Chart data
  const chartData = useMemo(() => {
    const map = new Map();

    invoices.forEach((inv) => {
      const month = new Date(inv.issueDate).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!map.has(month)) {
        map.set(month, { name: month, paidRevenue: 0, unpaidRevenue: 0 });
      }

      const bucket = map.get(month);
      if (inv.status === "paid") {
        bucket.paidRevenue += Number(inv.total || 0);
      } else {
        bucket.unpaidRevenue += Number(inv.total || 0);
      }
    });

    const data = Array.from(map.values());
return data.length > 0 ? data : [{ name: "No data", paidRevenue: 0, unpaidRevenue: 0 }];

  }, [invoices]);

  // Total revenue (paid + unpaid)
  const totalRevenue = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0).toFixed(2);
  }, [invoices]);

  const handleDownload = async (inv) => {
    const fullData = loadInvoiceById(inv.id);
    if (!fullData) return alert("Invoice data not found");

    if (invoicePdf && invoicePdf.size > 0) return downloadPdf();

    reset(fullData.data);
    await generatePdf(fullData.data);
    alert("✅ PDF generated! Click again to download.");
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">📊 Invoice Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${totalRevenue}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{invoices.length}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Last Updated</CardTitle></CardHeader>
          <CardContent className="text-lg">
            {new Date().toLocaleDateString()}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="unpaidRevenue" stackId="rev" fill="#f59e0b" name="Unpaid" />
              <Bar dataKey="paidRevenue" stackId="rev" fill="#10b981" name="Paid" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <p className="text-gray-500">No invoices found yet.</p>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Invoice #{inv.id}</span>

                  <div className="flex gap-2">
                    {inv.status === "paid" ? (
  <Button
    variant="outline"
    size="sm"
    onClick={() => markInvoiceUnpaid(inv.id)}
  >
    ↩️ Unmark Paid
  </Button>
) : (
  <Button
    variant="outline"
    size="sm"
    onClick={() => markInvoicePaid(inv.id)}
  >
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

                    <Button variant="destructive" size="sm" onClick={() => deleteInvoiceById(inv.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p><strong>Client:</strong> {inv.customerName || "Unknown"}</p>
                <p><strong>Total:</strong> ${Number(inv.total).toFixed(2)}</p>
                <p><strong>Date:</strong> {new Date(inv.issueDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {inv.status === "paid" ? "✅ Paid" : "⭕ Unpaid"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
