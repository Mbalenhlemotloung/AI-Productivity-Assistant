import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { displayName, useAuth } from "@/lib/auth";
import { useLocalStore } from "@/lib/store";
import { PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — MatricEnhle" },
      { name: "description", content: "Manage your MatricEnhle profile and preferences." },
      { property: "og:title", content: "Profile & Settings — MatricEnhle" },
      { property: "og:description", content: "Your MatricEnhle account settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [school, setSchool] = useLocalStore<string>("school", "");
  const [prefs, setPrefs] = useLocalStore("prefs", { deadlineAlerts: true, examAlerts: true });
  const [busy, setBusy] = useState(false);
  useEffect(() => setName(displayName(user)), [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Enter your name");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim().slice(0, 80) } });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  function clearData() {
    if (!confirm("Delete all MatricEnhle data saved on this device for your account?")) return;
    const prefix = `matricenhle:${user?.id}:`;
    Object.keys(localStorage).filter((k) => k.startsWith(prefix)).forEach((k) => localStorage.removeItem(k));
    toast.success("Local data cleared");
    setTimeout(() => location.reload(), 600);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile & Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile" icon={<User />}>
          <form onSubmit={save} className="space-y-3">
            <div className="space-y-1"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" value={user?.email ?? ""} disabled /></div>
            <div className="space-y-1"><Label htmlFor="school">School (optional, saved on this device)</Label><Input id="school" value={school} onChange={(e) => setSchool(e.target.value)} /></div>
            <Button type="submit" variant="hero" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Save profile</Button>
          </form>
        </Panel>
        <Panel title="Preferences & privacy" icon={<ShieldCheck />}>
          <div className="space-y-4">
            {([["deadlineAlerts", "Show application deadline alerts on dashboard"], ["examAlerts", "Show exam alerts on dashboard"]] as const).map(([k, l]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <Label htmlFor={k}>{l}</Label>
                <Switch id={k} checked={prefs[k]} onCheckedChange={(v) => setPrefs({ ...prefs, [k]: v })} />
              </div>
            ))}
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Your login is handled securely by our sign-in service (passwords are never stored in plain text). Applications, tasks, exams and notes are saved only in this browser on this device.
            </p>
            <Button variant="outline" className="text-destructive" onClick={clearData}><Trash2 /> Clear my data on this device</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
