import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — MatricEnhle" },
      { name: "description", content: "Get a link to reset your MatricEnhle password." },
      { property: "og:title", content: "Reset your password — MatricEnhle" },
      { property: "og:description", content: "Recover access to your MatricEnhle account." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = z.string().trim().email().safeParse(email);
    if (!p.success) return setError("Enter a valid email address");
    setError("");
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(p.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (err) return setError(err.message);
    setSent(true);
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll email you a secure link to set a new one.">
      {sent ? (
        <p role="status" className="rounded-lg bg-success-soft px-3 py-3 text-sm text-success">
          If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox and spam folder.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Student email</Label>
            <Input id="email" type="email" autoComplete="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Send reset link
          </Button>
        </form>
      )}
      <Link to="/" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
    </AuthLayout>
  );
}
