import { STATES } from "@/lib/seed/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function StateMarketsPage() {
  const active = STATES.filter((s) => s.hasMandate);
  const rest = STATES.filter((s) => !s.hasMandate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">State Markets</h1>
        <p className="text-sm text-muted-foreground">
          5 states currently have formal SDVOSB/VOSB preference programs. The rest are untapped beyond federal scope.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Active State Mandates</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {active.map((s) => (
              <div key={s.code} className="rounded-md border border-gold-500/30 bg-gold-500/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.code} · {formatCurrency(s.contractsValue)} state spend</div>
                  </div>
                  <Badge>{s.mandatePct}% target</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-2">{s.mandateNote}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All 50 States</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {STATES.map((s) => (
              <div key={s.code} className="rounded-md border border-border bg-navy-950 p-3 text-center">
                <div className="text-xs font-semibold text-foreground">{s.name}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{formatCurrency(s.contractsValue)}</div>
                {s.hasMandate && <div className="mt-1"><Badge className="text-[9px]">Mandate</Badge></div>}
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            {rest.length} states without formal mandate — VetAlliance monitors legislative pipelines and flags new programs as they emerge.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
