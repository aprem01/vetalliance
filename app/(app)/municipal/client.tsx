"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { ExternalLink, X, Landmark, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { Municipality } from "@/lib/types";

export function MunicipalClient({
  cities,
  summary,
}: {
  cities: Municipality[];
  summary: { totalSpend: number; withPreference: number; totalCities: number };
}) {
  const [prefOnly, setPrefOnly] = useState(false);
  const [selected, setSelected] = useState<Municipality | null>(null);

  const filtered = useMemo(
    () => (prefOnly ? cities.filter((c) => c.hasVeteranPreference) : cities),
    [cities, prefOnly]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Municipal Markets</h1>
        <p className="text-sm text-muted-foreground">
          Top {summary.totalCities} U.S. metros by procurement spend. Veteran-preference flags reflect each
          city's documented local program — verify the current RFP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Major Metros Tracked</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-300">{summary.totalCities}</div>
            <div className="text-xs text-muted-foreground mt-1">by population & procurement</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Combined Annual Spend</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(summary.totalSpend)}</div>
            <div className="text-xs text-muted-foreground mt-1">city-level procurement</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Cities w/ Veteran Preference</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.withPreference}</div>
            <div className="text-xs text-muted-foreground mt-1">of {summary.totalCities} tracked</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{filtered.length}</span>{" "}
          {prefOnly ? "veteran-preference" : "total"} cities
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <span>Veteran preference only</span>
          <button
            type="button"
            onClick={() => setPrefOnly((v) => !v)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              prefOnly ? "bg-gold-500" : "bg-navy-700"
            )}
            aria-pressed={prefOnly}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                prefOnly ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </button>
        </label>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No cities match"
          description="The veteran-preference toggle is excluding every tracked metro. Turn it off to see the full list."
          action={
            <Button variant="outline" size="sm" onClick={() => setPrefOnly(false)}>
              Show all cities
            </Button>
          }
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelected(c)}
            className={cn(
              "text-left rounded-lg border p-4 transition-colors",
              c.hasVeteranPreference
                ? "border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/20"
                : "border-border bg-navy-950 hover:bg-navy-700"
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-gold-300" />
                  {c.name}
                </div>
                <div className="text-[11px] text-muted-foreground">{c.state} · {(c.population / 1_000_000).toFixed(1)}M pop</div>
              </div>
              {c.hasVeteranPreference ? (
                <Badge variant="success">Vet Pref</Badge>
              ) : (
                <Badge variant="secondary">No Pref</Badge>
              )}
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gold-300 font-semibold">{formatCurrency(c.annualProcurementSpend)}</span>
              <span className="text-muted-foreground"> annual procurement</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {c.topSpendCategories.slice(0, 3).map((n) => (
                <Badge key={n} variant="secondary">NAICS {n}</Badge>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="text-[11px] text-muted-foreground italic border-t border-border pt-4">
        Note: live municipal RFP integration is planned. Current data reflects public procurement reports (2023-2024).
      </div>

      {selected && <MuniDrawer city={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function MuniDrawer({ city, onClose }: { city: Municipality; onClose: () => void }) {
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
            <div className="text-xs text-gold-400 uppercase tracking-wider">{city.state}</div>
            <h2 className="text-xl font-bold text-foreground">{city.name}</h2>
            {city.hasVeteranPreference ? (
              <Badge className="mt-1">Veteran Preference Active</Badge>
            ) : (
              <Badge variant="secondary" className="mt-1">No Veteran Preference</Badge>
            )}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-navy-700 hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Annual Procurement</div>
            <p className="text-foreground font-semibold">{formatCurrency(city.annualProcurementSpend)}</p>
            <p className="text-xs text-muted-foreground">Population: {city.population.toLocaleString()}</p>
          </section>

          {city.preferenceDetail && (
            <section>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Preference Detail</div>
              <p className="text-foreground leading-relaxed">{city.preferenceDetail}</p>
            </section>
          )}

          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Administering Office</div>
            <p className="text-foreground">{city.administeringOffice}</p>
          </section>

          {city.certificationLink && (
            <section>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Certification</div>
              <a href={city.certificationLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-300 hover:underline text-xs">
                Apply / Learn more <ExternalLink className="h-3 w-3" />
              </a>
            </section>
          )}

          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Procurement Portal</div>
            <a href={city.procurementPortal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-300 hover:underline">
              {city.procurementPortal.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              <ExternalLink className="h-3 w-3" />
            </a>
          </section>

          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Top Spend NAICS</div>
            <div className="flex flex-wrap gap-1">
              {city.topSpendCategories.map((n) => <Badge key={n} variant="secondary">{n}</Badge>)}
            </div>
          </section>

          <section>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Sample Opportunities</div>
            <ul className="space-y-2">
              {city.opportunitySamples.map((o, i) => (
                <li key={i} className="flex items-start justify-between gap-2">
                  <span className="text-foreground">{o.title}</span>
                  <span className="text-gold-300 font-semibold shrink-0">{formatCurrency(o.value)}</span>
                </li>
              ))}
            </ul>
          </section>

          {city.notes && (
            <section>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
              <p className="text-muted-foreground">{city.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
