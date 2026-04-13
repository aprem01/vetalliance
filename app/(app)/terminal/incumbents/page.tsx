import { fetchRecentSDVOSBAwards } from "@/lib/external/usaspending";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, daysUntil } from "@/lib/utils";

export const revalidate = 3600;

export default async function IncumbentsPage() {
  const { awards, mocked } = await fetchRecentSDVOSBAwards(100);

  const grouped = awards.reduce((acc, a) => {
    (acc[a.recipient] ||= []).push(a);
    return acc;
  }, {} as Record<string, typeof awards>);

  const rows = Object.entries(grouped)
    .map(([incumbent, group]) => {
      const nextPopEnd = group
        .map((g) => g.popEnd)
        .filter(Boolean)
        .sort()[0];
      return {
        incumbent,
        count: group.length,
        totalValue: group.reduce((s, g) => s + (g.amount || 0), 0),
        naicsSet: Array.from(new Set(group.map((g) => g.naics).filter(Boolean))),
        nextRecompete: nextPopEnd || "TBD",
        agencies: Array.from(new Set(group.map((g) => g.agency))),
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incumbent Intel</h1>
        <p className="text-sm text-muted-foreground">
          {mocked
            ? "Showing seed data — USASpending.gov unreachable."
            : "Live SDVOSB awardees from USASpending.gov (current FY). Pipeline value = sum of obligated amounts."}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Incumbent Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Incumbent</th>
                  <th className="text-left px-5 py-3">Contracts</th>
                  <th className="text-left px-5 py-3">Pipeline Value</th>
                  <th className="text-left px-5 py-3">NAICS</th>
                  <th className="text-left px-5 py-3">Agencies</th>
                  <th className="text-left px-5 py-3">Next Re-Compete</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const days = r.nextRecompete !== "TBD" ? daysUntil(r.nextRecompete) : 999;
                  return (
                    <tr
                      key={r.incumbent}
                      className="border-b border-border hover:bg-navy-700/50"
                    >
                      <td className="px-5 py-3 font-medium text-foreground">{r.incumbent}</td>
                      <td className="px-5 py-3">
                        <Badge variant="secondary">{r.count}</Badge>
                      </td>
                      <td className="px-5 py-3 text-gold-300 font-semibold">
                        {formatCurrency(r.totalValue)}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {r.naicsSet.slice(0, 3).join(", ") || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {r.agencies.slice(0, 2).join(", ")}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            days <= 30
                              ? "text-red-400"
                              : days <= 90
                              ? "text-amber-300"
                              : "text-muted-foreground"
                          }
                        >
                          {r.nextRecompete}
                          {r.nextRecompete !== "TBD" ? ` (${days}d)` : ""}
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
