import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpportunityCard } from "@/components/opportunity-card";
import { AgencyMandateBar } from "@/components/agency-mandate-bar";
import { OPPORTUNITIES } from "@/lib/seed/opportunities";
import { AGENCIES } from "@/lib/seed/agencies";
import { TEAMING_REQUESTS } from "@/lib/seed/teaming-requests";
import { formatCurrency } from "@/lib/utils";
import { Target, TrendingUp, Handshake, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const topOpps = [...OPPORTUNITIES].sort((a, b) => b.aiScore - a.aiScore).slice(0, 4);
  const behindAgencies = AGENCIES.filter((a) => !a.onTrack).slice(0, 3);
  const totalPipelineValue = TEAMING_REQUESTS.reduce((s, t) => s + t.valueEstimate, 0);

  const stats = [
    { label: "High-Fit Opportunities", value: OPPORTUNITIES.filter((o) => o.aiScore >= 75).length, icon: Target, trend: "+12 this week" },
    { label: "Agencies Behind Mandate", value: behindAgencies.length, icon: TrendingUp, trend: "HIGH OPPORTUNITY" },
    { label: "Active Teaming Requests", value: TEAMING_REQUESTS.length, icon: Handshake, trend: "+4 today" },
    { label: "Addressable Pipeline", value: formatCurrency(totalPipelineValue), icon: DollarSign, trend: "last 30 days" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Command view of your federal contracting pipeline.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, trend }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-gold-400" />
                <Badge variant="secondary" className="text-[10px]">{trend}</Badge>
              </div>
              <div className="text-2xl font-bold text-foreground mt-3">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Top AI-Scored Opportunities</h2>
            <Badge>Ranked by fit</Badge>
          </div>
          <div className="space-y-3">
            {topOpps.map((opp) => <OpportunityCard key={opp.id} opp={opp} />)}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Agencies Behind on SDVOSB Mandate</h2>
          <div className="space-y-3">
            {behindAgencies.map((a) => <AgencyMandateBar key={a.id} agency={a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
