"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, inventoryApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    dashboardApi.summary().then((r) => setSummary(r.data));
    inventoryApi.items().then((r) => setItems(r.data));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Sales Today" value={formatCurrency(summary?.salesToday || 0)} />
          <MetricCard title="Purchases Today" value={formatCurrency(summary?.purchasesToday || 0)} />
          <MetricCard title="Stock Value" value={formatCurrency(summary?.stockValue || 0)} />
          <MetricCard title="AR Outstanding" value={formatCurrency(summary?.accountsReceivable || 0)} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling SKUs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Top sellers will populate as POS transactions flow in.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {items.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">Reorder: {item.reorderLevel}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
