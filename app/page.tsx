import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Target, Handshake, Sparkles, BarChart3, FileCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-900">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gold-500 flex items-center justify-center text-navy-900 font-bold">V</div>
            <div>
              <div className="text-sm font-semibold text-foreground">VetAlliance</div>
              <div className="text-[10px] uppercase tracking-wider text-gold-400">Terminal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
            <Link href="/signup"><Button>Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300 mb-6">
          <Sparkles className="h-3 w-3" /> Now live — AI-powered federal contracting intelligence
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          The Bloomberg Terminal <span className="text-gold-400">for Veterans.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Find opportunities, team with Primes, stay compliant, and win federal contracts. Built for SDVOSBs, VOSBs, Prime Contractors, and Agencies.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup"><Button size="lg">Launch Terminal</Button></Link>
          <Link href="/dashboard"><Button size="lg" variant="outline">View Demo</Button></Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Target, title: "Opportunity Terminal", body: "Real-time SAM.gov feed with AI fit scoring, deadline urgency, and incumbent intel." },
          { icon: Handshake, title: "Teaming Marketplace", body: "Prime/sub matching, NDA exchange, and joint-venture workflows in one place." },
          { icon: Shield, title: "FAR Compliance Assist", body: "Auto-check FAR/DFARS clauses on solicitations. Catch blockers before bid/no-bid." },
          { icon: FileCheck, title: "Document Generator", body: "Capability statements, past performance, teaming agreements — drafted in seconds." },
          { icon: BarChart3, title: "Agency Intelligence", body: "Track 15 federal agencies against their SDVOSB mandates. Flag the laggards." },
          { icon: Sparkles, title: "AI Advisor", body: "Claude Sonnet 4.5 at your side — FAR clauses, proposal strategy, teaming moves." },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardContent className="p-6">
              <div className="h-10 w-10 rounded-md bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-gold-400" />
              </div>
              <div className="text-base font-semibold text-foreground mb-2">{title}</div>
              <div className="text-sm text-muted-foreground">{body}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <div>© 2026 VetAlliance. Built by veterans, for veterans.</div>
          <div>MVP demo — seed data, no real SAM.gov integration.</div>
        </div>
      </footer>
    </div>
  );
}
