"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inventoryApi } from "@/lib/api";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    inventoryApi.items().then((r) => setItems(r.data));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Code</th>
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Base Unit</th>
                    <th className="pb-2 font-medium">Batch Tracked</th>
                    <th className="pb-2 font-medium">Reorder Level</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3">{item.code}</td>
                      <td className="py-3">{item.name}</td>
                      <td className="py-3">{item.baseUnit?.symbol}</td>
                      <td className="py-3">{item.isBatchTracked ? "Yes" : "No"}</td>
                      <td className="py-3">{item.reorderLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
