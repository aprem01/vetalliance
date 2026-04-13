import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  computeAgencyPredictions,
  generateAgencyNarrative,
  type AgencyPrediction,
} from "@/lib/analytics/predictions";
import { hasAnthropic } from "@/lib/anthropic";

export const revalidate = 3600;

const FY_Q_LABEL: Record<number, string> = {
  1: "Q1 (Oct–Dec)",
  2: "Q2 (Jan–Mar)",
  3: "Q3 (Apr–Jun)",
  4: "Q4 (Jul–Sep)",
};

export default async function PredictionsPage() {
  const { predictions, mocked, fyQuarter } = await computeAgencyPredictions(10);

  // Generate narratives in parallel; deduped by in-memory cache inside helper.
  const narratives = hasAnthropic()
    ? await Promise.all(predictions.map((p) => generateAgencyNarrative(p)))
    : predictions.map(() => undefined);

  const enriched: AgencyPrediction[] = predictions.map((p, i) => ({
    ...p,
    narrative: narratives[i],
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-foreground">Predictive Alerts</h1>
          <Badge variant="warning">FORECAST</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Bloomberg-style predictive intelligence: what the top SDVOSB-awarding agencies are{" "}
          <em>likely</em> to do in {FY_Q_LABEL[fyQuarter.q]} FY{fyQuarter.fy}, based on 3 FY of
          USASpending award history.{" "}
          {mocked
            ? "USASpending fell back — showing modeled estimates from seed data."
            : "Live from USASpending.gov."}{" "}
          {!hasAnthropic() && (
            <span className="text-amber-400">
              (Set ANTHROPIC_API_KEY for synthesized narratives.)
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enriched.map((p) => (
          <PredictionCard key={p.agency} p={p} />
        ))}
        {enriched.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              No historical awards surfaced. Try again later.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PredictionCard({ p }: { p: AgencyPrediction }) {
  const center =
    (p.expectedCountLow + p.expectedCountHigh) / 2 || p.avgCountPerQuarter || 1;
  const span = Math.max(p.expectedCountHigh - p.expectedCountLow, 1);
  // Normalize confidence bar over 0..(high * 1.5)
  const maxScale = Math.max(p.expectedCountHigh * 1.5, 6);
  const leftPct = Math.max(0, (p.expectedCountLow / maxScale) * 100);
  const widthPct = Math.max(2, (span / maxScale) * 100);
  const centerPct = (center / maxScale) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{p.agency}</CardTitle>
          <Badge variant="warning">FORECAST</Badge>
        </div>
        <div className="text-[11px] text-muted-foreground">
          avg {p.avgCountPerQuarter} awards/qtr · stdev {p.stdevCount} · avg ${" "}
          {formatCurrency(p.avgAmountPerQuarter)}/qtr
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-1">
            Expected this quarter
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-foreground">
              {p.expectedCountLow}–{p.expectedCountHigh}
            </div>
            <div className="text-xs text-muted-foreground">awards</div>
            <div className="ml-auto text-sm text-gold-300">
              ~{formatCurrency(p.expectedAmount)}
            </div>
          </div>
          {/* Confidence bar */}
          <div className="relative mt-2 h-2 rounded-full bg-navy-700 overflow-hidden">
            <div
              className="absolute top-0 h-2 bg-gold-500/40"
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            />
            <div
              className="absolute top-0 h-2 w-0.5 bg-gold-300"
              style={{ left: `${centerPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0</span>
            <span>confidence band (±1σ)</span>
            <span>{Math.round(maxScale)}</span>
          </div>
        </div>

        {p.narrative && (
          <div className="rounded-md border border-gold-500/30 bg-gold-500/5 px-3 py-2 text-xs text-gold-100">
            {p.narrative}
          </div>
        )}

        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Dominant NAICS
          </div>
          <div className="flex flex-wrap gap-1">
            {p.dominantNaics.length === 0 && (
              <span className="text-xs text-muted-foreground">No data</span>
            )}
            {p.dominantNaics.map((n) => (
              <Badge key={n.code} variant="secondary" className="text-[10px]">
                {n.code}
                {n.label ? ` · ${n.label.slice(0, 28)}` : ""} · {n.count}
              </Badge>
            ))}
          </div>
        </div>

        {p.typicalMonths.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="text-gold-400 font-semibold">Typical months:</span>{" "}
            {p.typicalMonths.join(", ")}
          </div>
        )}

        <div className="rounded-md border border-border bg-navy-950 px-3 py-2 text-xs">
          <div className="text-[11px] uppercase tracking-wider text-gold-400 mb-0.5">
            Recommended action
          </div>
          <div className="text-foreground">{p.recommendation}</div>
        </div>

        {p.incumbentExpirations.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              Incumbent POP endings (≤180d)
            </div>
            <ul className="space-y-1">
              {p.incumbentExpirations.slice(0, 3).map((x, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-xs border-b border-border/40 pb-1"
                >
                  <span className="truncate text-foreground">{x.recipient}</span>
                  <span className="text-muted-foreground ml-2 shrink-0">
                    {x.popEnd} · {formatCurrency(x.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
