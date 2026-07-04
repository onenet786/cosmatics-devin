"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { approvalsApi } from "@/lib/api";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);

  const load = () => approvalsApi.pending().then((r) => setApprovals(r.data));

  useEffect(() => {
    load();
  }, []);

  const decide = async (id: string, status: "APPROVED" | "REJECTED") => {
    await approvalsApi.decide(id, status);
    load();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Approval Center</h1>
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {approvals.length === 0 && <p className="text-muted-foreground">No pending approvals.</p>}
            {approvals.map((a) => (
              <div key={a.id} className="mb-4 flex flex-col gap-2 border-b pb-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{a.module}</span>
                  <span className="text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Requested by {a.requestedBy?.firstName}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide(a.id, "APPROVED")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => decide(a.id, "REJECTED")}>Reject</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
