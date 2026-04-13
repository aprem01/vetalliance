import { AGENCIES } from "@/lib/seed/agencies";
import { AgencyMandateBar } from "@/components/agency-mandate-bar";
import { Badge } from "@/components/ui/badge";

export default function AgenciesPage() {
  const behind = AGENCIES.filter((a) => !a.onTrack);
  const onTrack = AGENCIES.filter((a) => a.onTrack);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agency Mandate Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Agencies below the SBA 3% SDVOSB goal are actively looking for qualified firms.
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="destructive">HIGH OPPORTUNITY</Badge>
          <span className="text-sm text-muted-foreground">{behind.length} agencies behind mandate</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {behind.map((a) => <AgencyMandateBar key={a.id} agency={a} />)}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="success">ON TRACK</Badge>
          <span className="text-sm text-muted-foreground">{onTrack.length} agencies at or above mandate</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {onTrack.map((a) => <AgencyMandateBar key={a.id} agency={a} />)}
        </div>
      </section>
    </div>
  );
}
