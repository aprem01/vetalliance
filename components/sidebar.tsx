"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Target, Building2, Users, Handshake, KanbanSquare, Send,
  ShieldCheck, FileText, BarChart3, Map, GraduationCap, MessageSquare, Menu, X,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV: { section: string; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    section: "Command",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    section: "Terminal",
    items: [
      { href: "/terminal/opportunities", label: "Opportunities", icon: Target },
      { href: "/terminal/agencies", label: "Agencies", icon: Building2 },
      { href: "/terminal/incumbents", label: "Incumbents", icon: Users },
      { href: "/terminal/predictions", label: "Predictions", icon: TrendingUp },
    ],
  },
  {
    section: "Teaming",
    items: [
      { href: "/teaming/partners", label: "Find Partners", icon: Handshake },
      { href: "/teaming/pipeline", label: "Pipeline", icon: KanbanSquare },
      { href: "/teaming/requests", label: "Requests", icon: Send },
    ],
  },
  {
    section: "Compliance",
    items: [
      { href: "/compliance/far-check", label: "FAR Check", icon: ShieldCheck },
      { href: "/compliance/documents", label: "Documents", icon: FileText },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/state-markets", label: "State Markets", icon: Map },
      { href: "/education", label: "Education", icon: GraduationCap },
      { href: "/advisor", label: "AI Advisor", icon: MessageSquare },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed top-3 left-3 z-50 md:hidden inline-flex items-center justify-center rounded-md bg-navy-700 p-2 text-foreground"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 border-r border-border bg-navy-950 transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
            <div className="h-8 w-8 rounded-md bg-gold-500 flex items-center justify-center text-navy-900 font-bold">V</div>
            <div>
              <div className="text-sm font-semibold text-foreground">VetAlliance</div>
              <div className="text-[10px] uppercase tracking-wider text-gold-400">Terminal</div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            {NAV.map((group) => (
              <div key={group.section} className="mb-4">
                <div className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.section}
                </div>
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-5 py-2 text-sm transition-colors",
                        active ? "bg-navy-700 text-gold-300 border-l-2 border-gold-500" : "text-muted-foreground hover:bg-navy-700 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="border-t border-border p-4">
            <div className="text-[10px] text-muted-foreground">Signed in as</div>
            <div className="text-sm text-foreground">Demo Operator</div>
            <div className="text-[10px] text-gold-400 uppercase">SDVOSB</div>
          </div>
        </div>
      </aside>
    </>
  );
}
