import type { Agency } from "@/lib/types";
import { Badge } from "./ui/badge";
import { formatCurrency, cn } from "@/lib/utils";

export function AgencyMandateBar({ agency }: { agency: Agency }) {
  const ratio = Math.min(1.5, agency.sdvosbActual / agency.sdvosbMandate);
  const pct = Math.min(100, (agency.sdvosbActual / (agency.sdvosbMandate * 1.5)) * 100);
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{agency.name}</div>
          <div className="text-[11px] text-muted-foreground">{agency.abbr} · {formatCurrency(agency.totalObligations)} FY obligations · {agency.contacts} POCs</div>
        </div>
        {agency.onTrack ? (
          <Badge variant="success">On Track</Badge>
        ) : (
          <Badge variant="destructive">HIGH OPPORTUNITY</Badge>
        )}
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-navy-700">
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full",
            agency.onTrack ? "bg-emerald-500" : "bg-red-500"
          )}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute top-0 h-full w-px bg-gold-500" style={{ left: `${(1 / 1.5) * 100}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Actual: <span className="font-semibold text-foreground">{agency.sdvosbActual}%</span></span>
        <span className="text-gold-400">Mandate: {agency.sdvosbMandate}%</span>
        <span className={cn("font-medium", ratio >= 1 ? "text-emerald-400" : "text-red-400")}>
          {ratio >= 1 ? `+${((ratio - 1) * 100).toFixed(0)}% over` : `${((1 - ratio) * 100).toFixed(0)}% under`}
        </span>
      </div>
    </div>
  );
}
