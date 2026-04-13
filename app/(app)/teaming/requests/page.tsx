"use client";
import { useState } from "react";
import { TEAMING_REQUESTS } from "@/lib/seed/teaming-requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, daysUntil } from "@/lib/utils";
import { Handshake, Send } from "lucide-react";

export default function RequestsPage() {
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState(TEAMING_REQUESTS);
  const [form, setForm] = useState({
    opportunityTitle: "",
    role: "Sub Seeking Prime" as "Sub Seeking Prime" | "Prime Seeking Sub",
    agency: "VA",
    naics: "541512",
    neededCapabilities: "",
    valueEstimate: 5_000_000,
    deadline: "2026-06-30",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setRequests([{
      id: `t${Date.now()}`,
      requester: "Arlington Defense Solutions LLC",
      role: form.role,
      opportunityTitle: form.opportunityTitle,
      agency: form.agency,
      naics: form.naics,
      neededCapabilities: form.neededCapabilities.split(",").map((s) => s.trim()).filter(Boolean),
      valueEstimate: Number(form.valueEstimate),
      deadline: form.deadline,
      postedAt: new Date().toISOString().slice(0, 10),
    }, ...requests]);
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teaming Requests</h1>
          <p className="text-sm text-muted-foreground">Post openly or browse active teaming requests from the network.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Send className="h-4 w-4" /> {showForm ? "Cancel" : "Post Request"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Teaming Request</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1"><Label>Opportunity Title</Label><Input required value={form.opportunityTitle} onChange={(e) => setForm({ ...form, opportunityTitle: e.target.value })} /></div>
              <div className="space-y-1"><Label>Role</Label>
                <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "Sub Seeking Prime" | "Prime Seeking Sub" })}>
                  <option>Sub Seeking Prime</option>
                  <option>Prime Seeking Sub</option>
                </Select>
              </div>
              <div className="space-y-1"><Label>Agency</Label><Input value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} /></div>
              <div className="space-y-1"><Label>NAICS</Label><Input value={form.naics} onChange={(e) => setForm({ ...form, naics: e.target.value })} /></div>
              <div className="space-y-1"><Label>Value Estimate ($)</Label><Input type="number" value={form.valueEstimate} onChange={(e) => setForm({ ...form, valueEstimate: Number(e.target.value) })} /></div>
              <div className="space-y-1"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
              <div className="md:col-span-2 space-y-1"><Label>Needed capabilities (comma-sep)</Label><Textarea value={form.neededCapabilities} onChange={(e) => setForm({ ...form, neededCapabilities: e.target.value })} /></div>
              <div className="md:col-span-2"><Button type="submit" className="w-full">Post</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {requests.map((r) => {
          const d = daysUntil(r.deadline);
          return (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{r.opportunityTitle}</div>
                    <div className="text-[11px] text-muted-foreground">Posted by {r.requester} · {r.postedAt}</div>
                  </div>
                  <Badge variant={r.role === "Prime Seeking Sub" ? "default" : "secondary"}>{r.role}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.neededCapabilities.map((c) => <Badge key={c} variant="outline">{c}</Badge>)}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{r.agency} · NAICS {r.naics}</span>
                  <span className="text-gold-300 font-semibold">{formatCurrency(r.valueEstimate)}</span>
                  <span className={d <= 14 ? "text-red-400" : "text-muted-foreground"}>{d}d</span>
                </div>
                <Button size="sm" className="w-full mt-3"><Handshake className="h-3 w-3" /> Express Interest</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
