"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import { AGENCIES } from "@/lib/seed/agencies";
import { OPPORTUNITIES } from "@/lib/seed/opportunities";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const mandateData = AGENCIES.map((a) => ({ name: a.abbr, mandate: a.sdvosbMandate, actual: a.sdvosbActual }));

  const opportunitiesByAgency = Object.entries(
    OPPORTUNITIES.reduce((acc, o) => {
      acc[o.agency] = (acc[o.agency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  const setAsideBreakdown = Object.entries(
    OPPORTUNITIES.reduce((acc, o) => {
      acc[o.setAside] = (acc[o.setAside] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const pipelineTrend = months.map((m, i) => ({ month: m, pipeline: 3.2 + i * 1.4 + Math.random(), wins: 0.4 + i * 0.3 }));

  const COLORS = ["#C9A84C", "#D4B45E", "#E2C87A", "#A88A33", "#8FA0B8", "#1F3352"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your capture metrics vs. federal market trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>SDVOSB Mandate vs Actual</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mandateData}>
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
          <CardHeader><CardTitle>Opportunities by Agency</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opportunitiesByAgency} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1F3352" />
                <XAxis type="number" stroke="#8FA0B8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#8FA0B8" fontSize={11} width={60} />
                <Tooltip contentStyle={{ background: "#0F1E33", border: "1px solid #1F3352" }} />
                <Bar dataKey="count" fill="#C9A84C" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pipeline Trend ($M)</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>Set-Aside Breakdown</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={setAsideBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {setAsideBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
