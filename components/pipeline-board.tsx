import type { PipelineItem } from "@/lib/types";
import { Badge } from "./ui/badge";
import { formatCurrency } from "@/lib/utils";

const STAGES: PipelineItem["stage"][] = [
  "Prospect", "Outreach", "NDA", "Teaming Agreement", "Proposal", "Award",
];

export function PipelineBoard({ items }: { items: PipelineItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {STAGES.map((stage) => {
        const stageItems = items.filter((i) => i.stage === stage);
        const total = stageItems.reduce((sum, i) => sum + i.value * (i.probability / 100), 0);
        return (
          <div key={stage} className="rounded-lg bg-navy-950 border border-border flex flex-col min-h-[400px]">
            <div className="border-b border-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">{stage}</div>
                <Badge variant="secondary">{stageItems.length}</Badge>
              </div>
              <div className="text-xs text-gold-400 mt-1">Weighted: {formatCurrency(total)}</div>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {stageItems.map((item) => (
                <div key={item.id} className="rounded-md bg-card border border-border p-3 hover:border-gold-500/40 transition-colors cursor-pointer">
                  <div className="text-xs font-medium text-foreground leading-snug mb-2">{item.opportunityTitle}</div>
                  <div className="text-[10px] text-muted-foreground">{item.agency}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-gold-300 font-semibold">{formatCurrency(item.value)}</span>
                    <span className="text-muted-foreground">{item.probability}%</span>
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground truncate">→ {item.nextAction}</div>
                </div>
              ))}
              {stageItems.length === 0 && (
                <div className="text-[11px] text-muted-foreground text-center py-6">No items</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
