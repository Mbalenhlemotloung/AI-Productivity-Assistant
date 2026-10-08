import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, ExternalLink, FileText, Info, NotebookPen } from "lucide-react";
import { useLocalStore } from "@/lib/store";
import { PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/nsfas")({
  head: () => ({
    meta: [
      { title: "NSFAS Support — MatricEnhle" },
      { name: "description", content: "Understand NSFAS and prepare your application with checklists." },
      { property: "og:title", content: "NSFAS Support — MatricEnhle" },
      { property: "og:description", content: "NSFAS preparation and document checklists for matric learners." },
    ],
  }),
  component: NsfasPage,
});

const PREP = [
  "Create a myNSFAS account on the official NSFAS website",
  "Check the current eligibility criteria on nsfas.org.za",
  "Confirm the current application opening and closing dates on official NSFAS channels",
  "Apply to universities or TVET colleges as well (NSFAS does not replace admission)",
  "Have a valid personal email address and cellphone number",
  "Ask a parent/guardian to help gather household information",
  "Keep your application reference number somewhere safe",
];

const DOCS = [
  "Your South African ID or birth certificate",
  "ID copies of parents/guardian(s)",
  "Proof of household income, if applicable",
  "Death certificate(s), if applicable",
  "Signed consent form, if required",
  "Any additional documents the official NSFAS site lists for your situation",
];

function Checklist({ items, storeKey, icon, title }: { items: string[]; storeKey: string; icon: React.ReactNode; title: string }) {
  const [done, setDone] = useLocalStore<string[]>(storeKey, []);
  const pct = Math.round((done.length / items.length) * 100);
  return (
    <Panel title={title} icon={icon} action={<span className="text-sm font-semibold text-primary">{pct}%</span>}>
      <Progress value={pct} className="mb-4" />
      <ul className="space-y-2">
        {items.map((it, i) => {
          const id = `${storeKey}-${i}`;
          const checked = done.includes(it);
          return (
            <li key={it} className="flex items-start gap-3 rounded-lg px-1 py-1">
              <Checkbox
                id={id}
                checked={checked}
                className="mt-0.5"
                onCheckedChange={(v) => setDone((d) => (v ? [...d, it] : d.filter((x) => x !== it)))}
              />
              <label htmlFor={id} className={checked ? "text-sm text-muted-foreground line-through" : "text-sm"}>{it}</label>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function NsfasPage() {
  const [notes, setNotes] = useLocalStore<string>("nsfas-notes", "");
  return (
    <div className="space-y-6">
      <PageHeader title="NSFAS Support" subtitle="Get ready to apply for funding with confidence." />

      <section className="relative overflow-hidden rounded-3xl bg-hero p-6 text-plum-foreground sm:p-8">
        <h2 className="text-2xl font-bold">What is NSFAS?</h2>
        <p className="mt-2 max-w-3xl text-plum-foreground/85">
          The National Student Financial Aid Scheme (NSFAS) is a South African government bursary scheme that helps
          eligible students from low-income households pay for studies at public universities and TVET colleges. It can
          cover things like tuition, accommodation, transport and learning materials, depending on current rules.
        </p>
        <Button asChild variant="hero" size="lg" className="mt-5">
          <a href="https://www.nsfas.org.za/" target="_blank" rel="noopener noreferrer">
            Visit the official NSFAS website <ExternalLink />
          </a>
        </Button>
      </section>

      <div role="note" className="flex gap-3 rounded-xl border border-teal/30 bg-teal-soft p-4 text-sm">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
        <p>
          Requirements, documents and dates can change every year. Always verify current information on{" "}
          <a className="font-semibold underline" href="https://www.nsfas.org.za/" target="_blank" rel="noopener noreferrer">nsfas.org.za</a>{" "}
          and official NSFAS channels. MatricEnhle does not submit NSFAS applications for you.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Checklist title="Application preparation" icon={<ClipboardCheck />} items={PREP} storeKey="nsfas-prep" />
        <Checklist title="Document checklist" icon={<FileText />} items={DOCS} storeKey="nsfas-docs" />
      </div>

      <Panel title="My NSFAS status notes" icon={<NotebookPen />}>
        <label htmlFor="nsfas-notes" className="mb-2 block text-sm text-muted-foreground">
          Record your own progress, e.g. date applied, status messages you saw on myNSFAS, follow-ups. Avoid entering ID numbers or passwords. Saved on this device only.
        </label>
        <Textarea id="nsfas-notes" rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Applied on … — status shows 'Application submitted'. Need to upload consent form." />
      </Panel>
    </div>
  );
}
