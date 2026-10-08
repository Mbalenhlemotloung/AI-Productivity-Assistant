import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { AuthLayout, GoogleIcon } from "@/components/auth-layout";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Log in — MatricEnhle" },
      { name: "description", content: "Log in to MatricEnhle, your matric-to-university study and application companion." },
      { property: "og:title", content: "MatricEnhle — Your Matric-to-University Companion" },
      { property: "og:description", content: "Exam countdowns, university application tracking, NSFAS prep and AI study tools for Grade 12 learners." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Enter your password"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<import("@/lib/store").FormErrors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      setErrors({
        form: error.message.includes("Email not confirmed")
          ? "Please confirm your email first — check your inbox for the link."
          : "Incorrect email or password. Please try again.",
      });
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setErrors({ form: "Google sign-in failed. Please try again." });
  }

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Log in to continue your matric journey.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {errors.form && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.form}
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Student email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-err" : undefined}
          />
          {errors.email && <p id="email-err" className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Log in
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <Button type="button" variant="outline" size="lg" className="w-full" onClick={google}>
        <GoogleIcon /> Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to MatricEnhle?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
