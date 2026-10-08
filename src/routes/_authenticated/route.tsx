import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { displayName, useAuth } from "@/lib/auth";
import { Logo } from "@/components/brand";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/" });
  },
  component: AppShell,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "University Applications", icon: GraduationCap },
  { to: "/nsfas", label: "NSFAS Support", icon: HandCoins },
  { to: "/past-papers", label: "Past Papers", icon: BookOpen },
  { to: "/ai-assistant", label: "AI Study Assistant", icon: Sparkles },
  { to: "/planner", label: "Study Planner", icon: CalendarCheck },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/settings", label: "Profile & Settings", icon: Settings },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }
  return (
    <div className="flex h-full flex-col bg-sidebar p-4 text-sidebar-foreground">
      <Link to="/dashboard" onClick={onNavigate} className="mb-6 px-2 py-1">
        <Logo light />
      </Link>
      <nav aria-label="Main" className="flex-1 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-plum-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star"
            activeProps={{ className: "bg-sidebar-accent text-plum-foreground shadow-glow" }}
          >
            <Icon className="h-4.5 w-4.5" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
        <p className="truncate text-sm font-semibold text-plum-foreground">{displayName(user)}</p>
        <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
        <button
          onClick={signOut}
          className="mt-2 flex items-center gap-2 text-xs font-semibold text-blush hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star"
        >
          <LogOut className="h-3.5 w-3.5" /> Log out
        </button>
      </div>
    </div>
  );
}

function AppShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">
        <SidebarContent />
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-sidebar px-4 py-2 lg:hidden">
        <Logo light />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="text-plum-foreground hover:bg-sidebar-accent hover:text-plum-foreground"
        >
          <Menu className="!size-5" />
        </Button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-none p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
