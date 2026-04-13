import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScoreGauge } from "./score-gauge";
import { daysUntil, formatCurrency, urgencyColor, cn } from "@/lib/utils";
import { Calendar, MapPin, Building2 } from "lucide-react";

export function OpportunityCard({ opp }: { opp: Opportunity }) {
  const days = daysUntil(opp.deadline);
  return (
    <Card className="hover:border-gold-500/40 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge>{opp.setAside}</Badge>
              <Badge variant="secondary">NAICS {opp.naics}</Badge>
              <Badge variant="outline">{opp.status}</Badge>
            </div>
            <Link href={`#${opp.id}`} className="text-base font-semibold text-foreground hover:text-gold-300 leading-tight block mb-1">
              {opp.title}
            </Link>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{opp.agency}{opp.subAgency ? ` · ${opp.subAgency}` : ""}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{opp.location}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{opp.solicitationNumber}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{opp.description}</p>
          </div>
          <div className="flex flex-col items-center gap-6 shrink-0">
            <ScoreGauge score={opp.aiScore} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 pt-3 border-t border-border">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Value</div>
            <div className="text-sm font-semibold text-foreground">{formatCurrency(opp.valueLow)} – {formatCurrency(opp.valueHigh)}</div>
          </div>
          <div className={cn("rounded-md border px-3 py-1.5 text-xs font-medium", urgencyColor(days))}>
            {days <= 0 ? "Closed" : `${days} days left`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
