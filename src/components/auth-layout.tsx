import type { ReactNode } from "react";
import { Logo, Mascot, StarField } from "./brand";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-hero p-10 text-plum-foreground lg:flex lg:flex-col">
        <StarField />
        <Logo light />
        <div className="relative z-10 my-auto max-w-md">
          <Mascot float className="mb-6 h-44 w-44 drop-shadow-2xl" />
          <h2 className="text-4xl font-extrabold leading-tight">
            Your future starts here <span aria-hidden>✨</span>
          </h2>
          <p className="mt-4 text-lg text-plum-foreground/80">
            Plan matric revision, keep every university application on track and get NSFAS-ready — with
            AI study help built in.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {["Exam countdowns", "Application tracker", "NSFAS checklists", "AI study tools"].map((f) => (
              <li key={f} className="rounded-xl border border-plum-foreground/15 bg-plum-foreground/10 px-3 py-2 backdrop-blur">
                ★ {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-plum-foreground/60">Built for South African Grade 12 learners.</p>
      </aside>
      <main className="flex items-center justify-center bg-gradient-soft px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo />
          </div>
          <div className="rounded-3xl border bg-card p-7 shadow-soft sm:p-9">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7H2.1a11 11 0 0 0 0 10z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}
