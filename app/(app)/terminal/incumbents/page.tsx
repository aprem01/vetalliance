import { OPPORTUNITIES } from "@/lib/seed/opportunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, daysUntil } from "@/lib/utils";

export default function IncumbentsPage() {
  const grouped = OPPORTUNITIES.filter((o) => o.incumbent).reduce((acc, o) => {
    (acc[o.incumbent!] ||= []).push(o);
    return acc;
  }, {} as Record<string, typeof OPPORTUNITIES>);

  const rows = Object.entries(grouped)
    .map(([incumbent, opps]) => ({
      incumbent,
      count: opps.length,
      totalValue: opps.reduce((s, o) => s + o.valueHigh, 0),
      avgScore: Math.round(opps.reduce((s, o) => s + o.aiScore, 0) / opps.length),
      nextRecompete: opps.map((o) => o.deadline).sort()[0],
      agencies: Array.from(new Set(opps.map((o) => o.agency))),
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incumbent Intel</h1>
        <p className="text-sm text-muted-foreground">Large primes holding contracts coming up for re-compete.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Incumbent Portfolio</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Incumbent</th>
                  <th className="text-left px-5 py-3">Contracts</th>
                  <th className="text-left px-5 py-3">Pipeline Value</th>
                  <th className="text-left px-5 py-3">Avg AI Fit</th>
                  <th className="text-left px-5 py-3">Agencies</th>
                  <th className="text-left px-5 py-3">Next Re-Compete</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const days = daysUntil(r.nextRecompete);
                  return (
                    <tr key={r.incumbent} className="border-b border-border hover:bg-navy-700/50">
                      <td className="px-5 py-3 font-medium text-foreground">{r.incumbent}</td>
                      <td className="px-5 py-3"><Badge variant="secondary">{r.count}</Badge></td>
                      <td className="px-5 py-3 text-gold-300 font-semibold">{formatCurrency(r.totalValue)}</td>
                      <td className="px-5 py-3">{r.avgScore}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.agencies.join(", ")}</td>
                      <td className="px-5 py-3">
                        <span className={days <= 30 ? "text-red-400" : days <= 90 ? "text-amber-300" : "text-muted-foreground"}>
                          {r.nextRecompete} ({days}d)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
