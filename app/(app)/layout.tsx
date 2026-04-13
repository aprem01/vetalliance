import { Sidebar } from "@/components/sidebar";
import { AdvisorDock } from "@/components/advisor-dock";
import { getSession } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabase()) {
    const session = await getSession();
    if (!session) redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-navy-900">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 pb-24">{children}</div>
      </main>
      <AdvisorDock />
    </div>
  );
}
