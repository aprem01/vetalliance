import { PipelineBoard } from "@/components/pipeline-board";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PIPELINE } from "@/lib/seed/pipeline";

export default function PipelinePage() {
  const totalWeighted = PIPELINE.reduce((s, i) => s + i.value * (i.probability / 100), 0);
  const totalValue = PIPELINE.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Capture Pipeline</h1>
          <p className="text-sm text-muted-foreground">Prospect → Award. Track captures through 6 stages.</p>
        </div>
        <div className="flex gap-3">
          <Card><CardContent className="p-3"><div className="text-[10px] uppercase text-muted-foreground">Unweighted</div><div className="text-lg font-bold text-foreground">{formatCurrency(totalValue)}</div></CardContent></Card>
          <Card><CardContent className="p-3"><div className="text-[10px] uppercase text-muted-foreground">Weighted</div><div className="text-lg font-bold text-gold-300">{formatCurrency(totalWeighted)}</div></CardContent></Card>
        </div>
      </div>
      <PipelineBoard items={PIPELINE} />
    </div>
  );
}
