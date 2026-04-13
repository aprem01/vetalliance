"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { ExternalLink, X } from "lucide-react";
import type { StateMandate } from "@/lib/seed/state-mandates";

interface Summary {
  activeCount: number;
  strongest: { code: string; name: string; pct: number } | null;
  estimatedAddressable: number;
}

export function StateMandateTracker({
  states,
  summary,
}: {
  states: StateMandate[];
  summary: Summary;
}) {
  const [activeOnly, setActiveOnly] = useState(true);
  const [selected, setSelected] = useState<StateMandate | null>(null);

  const filtered = useMemo(
    () => (activeOnly ? states.filter((s) => s.hasVeteranMandate) : states),
    [states, activeOnly]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">State Markets</h1>
        <p className="text-sm text-muted-foreground">
          Veteran business mandates across all 50 states. Tap any state for certification details,
          administering agency, and opportunity portal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">States with Active Mandates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-300">{summary.activeCount}</div>
            <div className="text-xs text-muted-foreground mt-1">of 50 states</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Strongest Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {summary.strongest ? `${summary.strongest.code} @ ${summary.strongest.pct}%` : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.strongest?.name || ""}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Est. Addressable State Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(summary.estimatedAddressable)}
            </div>
            <div className="text-xs text-amber-400/80 mt-1">
              Estimate: $100B baseline × (active / 50)
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="text-foreground font-semibold">{filtered.length}</span>{" "}
          {activeOnly ? "active-mandate" : "total"} states
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <span>Show only active mandates</span>
          <button
            type="button"
            onClick={() => setActiveOnly((v) => !v)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              activeOnly ? "bg-gold-500" : "bg-navy-700"
            )}
            aria-pressed={activeOnly}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                activeOnly ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </button>
        </label>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
        {filtered.map((s) => (
          <button
            key={s.code}
            type="button"
            onClick={() => setSelected(s)}
            className={cn(
              "rounded-md border p-3 text-left transition-colors",
              s.hasVeteranMandate
                ? "border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/20 text-foreground"
                : "border-border bg-navy-950 hover:bg-navy-700 text-muted-foreground"
            )}
            title={s.name}
          >
            <div className="text-[11px] font-semibold">{s.code}</div>
            <div className="text-[10px] truncate">{s.name}</div>
            {s.hasVeteranMandate && (
              <div className="mt-1 text-[10px] text-gold-300 font-semibold">
                {s.mandatePercent ? `${s.mandatePercent}%` : "Active"}
              </div>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <DetailDrawer state={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function DetailDrawer({ state, onClose }: { state: StateMandate; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end md:items-center md:justify-end"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md md:h-full bg-navy-950 border-t md:border-l border-border p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-gold-400 uppercase tracking-wider">{state.code}</div>
            <h2 className="text-xl font-bold text-foreground">{state.name}</h2>
            {state.hasVeteranMandate ? (
              <Badge className="mt-1">
                Active Mandate
                {state.mandatePercent ? ` · ${state.mandatePercent}%` : ""}
              </Badge>
            ) : (
              <Badge variant="secondary" className="mt-1">
                No State Mandate
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-navy-700 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              Summary
            </div>
            <p className="text-foreground leading-relaxed">{state.summary}</p>
          </section>

          {state.administeringAgency && (
            <section>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Administering Agency
              </div>
              <p className="text-foreground">{state.administeringAgency}</p>
            </section>
          )}

          {state.certificationName && (
            <section>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Certification
              </div>
              <p className="text-foreground">{state.certificationName}</p>
              {state.certificationLink && (
                <a
                  href={state.certificationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-gold-300 hover:underline text-xs"
                >
                  Apply / Learn more <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </section>
          )}

          {state.opportunityPortal && (
            <section>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Opportunity Portal
              </div>
              <a
                href={state.opportunityPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gold-300 hover:underline"
              >
                {state.opportunityPortal.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </section>
          )}

          {state.effectiveDate && (
            <section>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Effective Date
              </div>
              <p className="text-foreground">{state.effectiveDate}</p>
            </section>
          )}

          {state.notes && (
            <section>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Notes
              </div>
              <p className="text-muted-foreground">{state.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
