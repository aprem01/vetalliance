"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Shield, Flag, Building2, Landmark } from "lucide-react";
import type { UserRole } from "@/lib/types";

const ROLES: { role: UserRole; icon: React.ComponentType<{ className?: string }>; title: string; body: string }[] = [
  { role: "SDVOSB", icon: Shield, title: "SDVOSB", body: "Service-Disabled Veteran-Owned Small Business" },
  { role: "VOSB", icon: Flag, title: "VOSB", body: "Veteran-Owned Small Business" },
  { role: "Prime", icon: Building2, title: "Prime Contractor", body: "Seeking qualified veteran subs" },
  { role: "Agency", icon: Landmark, title: "Federal Agency", body: "Manage small business goals" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("SDVOSB");
  const [companyName, setCompanyName] = useState("");
  const [uei, setUei] = useState("");
  const [state, setState] = useState("VA");
  const [naics, setNaics] = useState("541512");
  const [capabilities, setCapabilities] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-navy-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome to VetAlliance</h1>
          <p className="text-muted-foreground mt-2">Tell us who you are so we can tailor your terminal.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. I am a…</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ROLES.map(({ role: r, icon: Icon, title, body }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    role === r ? "border-gold-500 bg-gold-500/10" : "border-border bg-card hover:border-gold-500/40"
                  )}
                >
                  <Icon className="h-5 w-5 text-gold-400 mb-2" />
                  <div className="text-sm font-semibold text-foreground">{title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{body}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Company profile</CardTitle>
            <CardDescription>These details drive your AI fit scoring.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Company Name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Arlington Defense Solutions LLC" />
              </div>
              <div className="space-y-1">
                <Label>UEI</Label>
                <Input value={uei} onChange={(e) => setUei(e.target.value)} placeholder="12 characters" />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Primary NAICS</Label>
                <Input value={naics} onChange={(e) => setNaics(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Core Capabilities</Label>
                <Input value={capabilities} onChange={(e) => setCapabilities(e.target.value)} placeholder="Cybersecurity, Cloud, DevSecOps" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full">Launch Terminal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
