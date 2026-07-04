"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { posApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function PosPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    posApi.sessions().then((r) => setSessions(r.data));
    posApi.transactions().then((r) => setTransactions(r.data));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">POS</h1>
          <Button>New Sale</Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.map((s) => (
                <div key={s.id} className="mb-2 flex justify-between border-b py-2 text-sm">
                  <span>{s.branch?.name}</span>
                  <span className={s.status === "OPEN" ? "text-green-600" : "text-muted-foreground"}>{s.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="mb-2 flex justify-between border-b py-2 text-sm">
                  <span>{t.number}</span>
                  <span>{formatCurrency(t.totalAmount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
