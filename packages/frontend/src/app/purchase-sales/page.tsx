"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { purchaseSalesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function PurchaseSalesPage() {
  const [salesInvoices, setSalesInvoices] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  useEffect(() => {
    purchaseSalesApi.salesInvoices().then((r) => setSalesInvoices(r.data));
    purchaseSalesApi.purchaseOrders().then((r) => setPurchaseOrders(r.data));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Purchase & Sales</h1>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {salesInvoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="mb-2 flex justify-between border-b py-2 text-sm">
                  <span>{inv.number}</span>
                  <span>{formatCurrency(inv.totalAmount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseOrders.slice(0, 5).map((po) => (
                <div key={po.id} className="mb-2 flex justify-between border-b py-2 text-sm">
                  <span>{po.number}</span>
                  <span className="text-muted-foreground">{po.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
