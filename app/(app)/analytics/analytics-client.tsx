"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export interface AnalyticsData {
  mandateData: Array<{ name: string; mandate: number; actual: number }>;
  topAgencySpend: Array<{ name: string; amount: number }>;
  topNaics: Array<{ name: string; value: number }>;
  ytdTotal: number;
  priorTotal: number;
  ytdFy: number;
  priorFy: number;
  mocked: boolean;
}

const COLORS = ["#C9A84C", "#D4B45E", "#E2C87A", "#A88A33", "#8FA0B8", "#1F3352"];

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const pipelineTrend = months.map((m, i) => ({
    month: m,
    pipeline: 3.2 + i * 1.4,
    wins: 0.4 + i * 0.3,
  }));

  const pctChange =
    data.priorTotal > 0
      ? ((data.ytdTotal - data.priorTotal) / data.priorTotal) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          {data.mocked
            ? "Market intelligence from seed data — USASpending fell back."
            : "Market intelligence live from USASpending.gov. Personal metrics from seed."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">YTD SDVOSB Awards (FY{data.ytdFy})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-300">{formatCurrency(data.ytdTotal)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              vs {formatCurrency(data.priorTotal)} in FY{data.priorFy} ({pctChange >= 0 ? "+" : ""}
              {pctChange.toFixed(1)}%)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Awarding Agency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-foreground truncate">
              {data.topAgencySpend[0]?.name || "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(data.topAgencySpend[0]?.amount || 0)} in SDVOSB awards
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Agencies Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data.topAgencySpend.length}</div>
            <div className="text-xs text-muted-foreground mt-1">top SDVOSB buyers this FY</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SDVOSB Mandate vs Actual</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.mandateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F3352" />
                <XAxis dataKey="name" stroke="#8FA0B8" fontSize={11} />
                <YAxis stroke="#8FA0B8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0F1E33", border: "1px solid #1F3352" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="mandate" fill="#1F3352" name="Mandate %" />
                <Bar dataKey="actual" fill="#C9A84C" name="Actual %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Agencies by SDVOSB Spend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topAgencySpend.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1F3352" />
                <XAxis
                  type="number"
                  stroke="#8FA0B8"
                  fontSize={11}
                  tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
                />
                <YAxis type="category" dataKey="name" stroke="#8FA0B8" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{ background: "#0F1E33", border: "1px solid #1F3352" }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Bar dataKey="amount" fill="#C9A84C" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Pipeline Trend ($M)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pipelineTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F3352" />
                <XAxis dataKey="month" stroke="#8FA0B8" fontSize={11} />
                <YAxis stroke="#8FA0B8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0F1E33", border: "1px solid #1F3352" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="pipeline" stroke="#C9A84C" strokeWidth={2} />
                <Line type="monotone" dataKey="wins" stroke="#34D399" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top NAICS (SDVOSB awards)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topNaics}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.topNaics.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0F1E33", border: "1px solid #1F3352" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
