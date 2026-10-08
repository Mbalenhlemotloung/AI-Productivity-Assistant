import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth-layout";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — MatricEnhle" },
      { name: "description", content: "Choose a new password for your MatricEnhle account." },
      { property: "og:title", content: "Set a new password — MatricEnhle" },
      { property: "og:description", content: "Finish resetting your MatricEnhle password." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setError("Use at least 8 characters");
    if (pw !== confirm) return setError("Passwords don't match");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (err) return setError(err.message.includes("session") ? "This reset link has expired. Request a new one." : err.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose something strong that you'll remember.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-1.5">
          <Label htmlFor="pw">New password</Label>
          <PasswordInput id="pw" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordInput id="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Update password
        </Button>
      </form>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">Back to login</Link>
    </AuthLayout>
  );
}
