import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AuthLayout, GoogleIcon } from "@/components/auth-layout";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — MatricEnhle" },
      { name: "description", content: "Join MatricEnhle to plan revision and track your university applications." },
      { property: "og:title", content: "Join MatricEnhle" },
      { property: "og:description", content: "Free study and application companion for South African matrics." },
    ],
  }),
  component: SignupPage,
});

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().email("Enter a valid email address").max(255),
    password: z.string().min(8, "Use at least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<import("@/lib/store").FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: parsed.data.name } },
    });
    setBusy(false);
    if (error) return setErrors({ form: error.message });
    setSent(true);
  }

  if (sent)
    return (
      <AuthLayout title="Check your email" subtitle="One more step to activate your account.">
        <div className="space-y-4 text-center">
          <MailCheck className="mx-auto h-12 w-12 text-teal" />
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <strong className="text-foreground">{form.email}</strong>. Click it,
            then log in.
          </p>
          <Button asChild variant="hero" className="w-full">
            <Link to="/">Back to login</Link>
          </Button>
        </div>
      </AuthLayout>
    );

  const field = (k: keyof typeof form, label: string, type = "text", auto?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      {type === "password" ? (
        <PasswordInput id={k} autoComplete={auto} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} />
      ) : (
        <Input id={k} type={type} autoComplete={auto} className="h-11" value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} />
      )}
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <AuthLayout title="Create your account" subtitle="Start planning your path to university.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {errors.form && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errors.form}</p>
        )}
        {field("name", "Full name", "text", "name")}
        {field("email", "Student email", "email", "email")}
        {field("password", "Password", "password", "new-password")}
        {field("confirm", "Confirm password", "password", "new-password")}
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Create account
        </Button>
      </form>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="mt-3 w-full"
        onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}
      >
        <GoogleIcon /> Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/" className="font-semibold text-primary hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
