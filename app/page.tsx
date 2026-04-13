import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Handshake,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  Map,
  Landmark,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-900">
      <header className="sticky top-0 z-30 border-b border-border bg-navy-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gold-500 flex items-center justify-center text-navy-900 font-bold">V</div>
            <div>
              <div className="text-sm font-semibold text-foreground">VetAlliance</div>
              <div className="text-[10px] uppercase tracking-wider text-gold-400">Terminal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block"><Button variant="ghost">Sign In</Button></Link>
            <Link href="/onboarding"><Button>Launch Terminal</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,164,65,0.12),transparent_60%)] pointer-events-none" />
        <div className="mx-auto max-w-6xl px-4 md:px-6 pt-16 md:pt-20 pb-10 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[11px] font-medium text-gold-300 mb-5">
            <Sparkles className="h-3 w-3" /> Live SAM.gov · USASpending · Claude Sonnet 4.5
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.05]">
            The Intelligence Terminal for{" "}
            <span className="text-gold-400">Federal Veteran Contracting.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            One command center for SDVOSBs, VOSBs, and Primes — live opportunities, agency
            mandate tracking, teaming matches, and FAR compliance, with an AI analyst on deck.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/onboarding">
              <Button size="lg">
                Launch Terminal <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline">See how it works</Button>
            </a>
          </div>

          {/* Trust bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border bg-border max-w-4xl mx-auto">
            {[
              { v: "1,400+", l: "Live SDVOSB opportunities" },
              { v: "15", l: "Federal agencies monitored" },
              { v: "11", l: "State veteran mandates" },
              { v: "$6.1B", l: "FY SDVOSB awards analyzed" },
            ].map(({ v, l }) => (
              <div key={l} className="bg-navy-950 px-4 py-5">
                <div className="text-2xl font-bold text-gold-300">{v}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            Live as of April 2026 · USASpending.gov + SAM.gov
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Target,
              title: "Intelligence",
              hook: "Live SAM.gov feed, AI fit scoring, agency mandate gaps, and incumbent POP tracking.",
              href: "/terminal/opportunities",
              subItems: [
                { icon: Building2, label: "Agency tracker" },
                { icon: TrendingUp, label: "Predictive alerts" },
                { icon: Map, label: "State markets" },
                { icon: Landmark, label: "Municipal" },
              ],
            },
            {
              icon: Handshake,
              title: "Teaming",
              hook: "Match with SDVOSBs, VOSBs, and Primes. Route requests, verify UEI/CAGE, build JVs.",
              href: "/teaming/partners",
              subItems: [
                { icon: Handshake, label: "Partner finder" },
                { icon: Sparkles, label: "AI match rationale" },
                { icon: ShieldCheck, label: "SAM entity verify" },
              ],
            },
            {
              icon: ShieldCheck,
              title: "Compliance",
              hook: "FAR/DFARS clause analysis, mentor-protégé pairings, capability statement drafting.",
              href: "/compliance/far-check",
              subItems: [
                { icon: ShieldCheck, label: "FAR clause check" },
                { icon: Sparkles, label: "Doc generator" },
                { icon: Handshake, label: "Mentor-protégé" },
              ],
            },
          ].map(({ icon: Icon, title, hook, href, subItems }) => (
            <Card key={title} className="group hover:border-gold-500/40 transition-colors">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="h-10 w-10 rounded-md bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-gold-400" />
                </div>
                <div className="text-lg font-semibold text-foreground mb-2">{title}</div>
                <div className="text-sm text-muted-foreground mb-4 leading-relaxed">{hook}</div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {subItems.map(({ icon: SubIcon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-navy-950 px-2 py-1 text-[10px] text-muted-foreground"
                    >
                      <SubIcon className="h-3 w-3 text-gold-400" /> {label}
                    </span>
                  ))}
                </div>
                <Link
                  href={href}
                  className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-gold-300 hover:text-gold-200"
                >
                  Learn more <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="rounded-xl border border-gold-500/30 bg-gradient-to-br from-gold-500/10 via-navy-950 to-navy-950 px-6 py-10 md:py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Stop hunting blindly.{" "}
            <span className="text-gold-400">Show up with intelligence.</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
            Two minutes to onboard. Zero cost to try. Your profile scores 100 live opportunities the moment you land.
          </p>
          <div className="mt-6">
            <Link href="/onboarding">
              <Button size="lg">
                Launch Terminal <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© 2026 VetAlliance. Built by veterans, for veterans.</div>
          <div>MVP demo · live SAM.gov + USASpending · Claude Sonnet 4.5</div>
        </div>
      </footer>
    </div>
  );
}
