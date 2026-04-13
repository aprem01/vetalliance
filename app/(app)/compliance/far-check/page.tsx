"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

const SAMPLE = `SOLICITATION NUMBER: VA-2026-1042
SET-ASIDE: Service-Disabled Veteran-Owned Small Business (SDVOSB)
NAICS: 541512 Computer Systems Design Services
SIZE STANDARD: $34 million

APPLICABLE FAR CLAUSES (INCORPORATED BY REFERENCE):
FAR 52.204-24 Representation Regarding Covered Telecommunications
FAR 52.219-14 Limitations on Subcontracting
FAR 19.14 Service-Disabled Veteran-Owned Small Business Program
DFARS 252.204-7012 Safeguarding Covered Defense Information
CMMC Level 2 assessment required prior to award.

Period of performance: 1 base year + 4 option years.`;

export default function FarCheckPage() {
  const [text, setText] = useState(SAMPLE);
  const [role, setRole] = useState("SDVOSB");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ clauses: Array<{ clause: string; status: string; note: string }>; summary: string; mocked?: boolean } | null>(null);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/check-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitationText: text, companyRole: role }),
      });
      const json = await res.json();
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  const icons = {
    OK: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
    Attention: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    Blocker: <XCircle className="h-4 w-4 text-red-400" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">FAR / DFARS Compliance Check</h1>
        <p className="text-sm text-muted-foreground">Paste a solicitation snippet. The advisor flags clauses by risk.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Input</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Your role</Label>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option>SDVOSB</option>
                <option>VOSB</option>
                <option>Prime</option>
              </Select>
            </div>
            <div>
              <Label>Solicitation Text</Label>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} className="font-mono text-xs" />
            </div>
            <Button onClick={run} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Compliance Check"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Results {result?.mocked && <Badge variant="warning">Mocked</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result && <div className="text-sm text-muted-foreground">Run a check to see results.</div>}
            {result && (
              <>
                <div className="text-sm text-foreground mb-4 p-3 rounded-md bg-navy-700">{result.summary}</div>
                <div className="space-y-3">
                  {result.clauses.map((c, i) => (
                    <div key={i} className="flex gap-3 border border-border rounded-md p-3">
                      <div className="shrink-0 mt-0.5">{icons[c.status as "OK" | "Attention" | "Blocker"] || icons.OK}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-foreground text-sm">{c.clause}</div>
                          <Badge
                            variant={c.status === "OK" ? "success" : c.status === "Blocker" ? "destructive" : "warning"}
                          >{c.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{c.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
