import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { uid, useLocalStore, type Application, type SubjectProgress, type Task } from "@/lib/store";
import { EmptyState, PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress — MatricEnhle" },
      { name: "description", content: "Track subject readiness, completed tasks and applications." },
      { property: "og:title", content: "Progress — MatricEnhle" },
      { property: "og:description", content: "See how your matric preparation is going." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [subjects, setSubjects] = useLocalStore<SubjectProgress[]>("subjects", []);
  const [tasks] = useLocalStore<Task[]>("tasks", []);
  const [apps] = useLocalStore<Application[]>("applications", []);
  const [name, setName] = useState("");
  const doneTasks = tasks.filter((t) => t.done).length;
  const submitted = apps.filter((a) => a.status !== "Not Started" && a.status !== "In Progress").length;

  const stat = (label: string, value: string, pct: number) => (
    <Panel><p className="text-sm text-muted-foreground">{label}</p><p className="mb-2 text-3xl font-bold">{value}</p><Progress value={pct} /></Panel>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Progress" subtitle="Rate how ready you feel for each subject and watch your preparation grow." />
      <div className="grid gap-4 sm:grid-cols-3">
        {stat("Study tasks completed", `${doneTasks}/${tasks.length}`, tasks.length ? (doneTasks / tasks.length) * 100 : 0)}
        {stat("Applications submitted+", `${submitted}/${apps.length}`, apps.length ? (submitted / apps.length) * 100 : 0)}
        {stat("Average readiness", `${subjects.length ? Math.round(subjects.reduce((s, x) => s + x.progress, 0) / subjects.length) : 0}%`, subjects.length ? subjects.reduce((s, x) => s + x.progress, 0) / subjects.length : 0)}
      </div>
      <Panel title="Subject readiness" icon={<BarChart3 />}>
        <form
          onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; setSubjects((a) => [...a, { id: uid(), subject: name.trim().slice(0, 60), progress: 0 }]); setName(""); }}
          className="mb-5 flex gap-2"
        >
          <Input aria-label="Subject name" placeholder="Add a subject, e.g. Life Sciences" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit"><Plus /> Add</Button>
        </form>
        {subjects.length === 0 ? <EmptyState title="No subjects yet" text="Add your matric subjects to track readiness." /> : (
          <ul className="space-y-5">
            {subjects.map((s) => (
              <li key={s.id}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">{s.progress >= 80 && <CheckCircle2 className="h-4 w-4 text-success" />}{s.subject}</span>
                  <span className="flex items-center gap-2 text-sm font-bold text-primary">{s.progress}%
                    <Button size="icon" variant="ghost" aria-label={`Remove ${s.subject}`} onClick={() => setSubjects((a) => a.filter((x) => x.id !== s.id))}><Trash2 /></Button>
                  </span>
                </div>
                <Slider aria-label={`${s.subject} readiness`} value={[s.progress]} max={100} step={5} onValueChange={([v]) => setSubjects((a) => a.map((x) => (x.id === s.id ? { ...x, progress: v } : x)))} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
