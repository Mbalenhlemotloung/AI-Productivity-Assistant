import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlarmClock, CalendarCheck, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAi } from "@/lib/use-ai";
import { daysUntil, formatDate, todayISO, uid, useLocalStore, type Exam, type Task } from "@/lib/store";
import { AiDisclaimer, CopyButton, EmptyState, Markdown, PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — MatricEnhle" },
      { name: "description", content: "Add exams and tasks, and generate an AI revision schedule." },
      { property: "og:title", content: "Study Planner — MatricEnhle" },
      { property: "og:description", content: "Plan your matric revision with AI." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [exams, setExams] = useLocalStore<Exam[]>("exams", []);
  const [tasks, setTasks] = useLocalStore<Task[]>("tasks", []);
  const [plan, setPlan] = useLocalStore<string>("ai-plan", "");
  const [ex, setEx] = useState({ subject: "", paper: "Paper 1", date: "" });
  const [tk, setTk] = useState({ title: "", subject: "", date: todayISO() });
  const [ai, setAi] = useState({ hours: "2", priorities: "", period: "week" });
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState(false);
  const { run, loading, error } = useAi("planner");

  function addExam(e: React.FormEvent) {
    e.preventDefault();
    if (!ex.subject.trim() || !ex.date) return setErr("Enter a subject and exam date.");
    setErr("");
    setExams((a) => [...a, { ...ex, subject: ex.subject.trim().slice(0, 80), id: uid() }]);
    setEx({ subject: "", paper: "Paper 1", date: "" });
  }
  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!tk.title.trim()) return;
    setTasks((a) => [...a, { ...tk, title: tk.title.trim().slice(0, 140), id: uid(), done: false }]);
    setTk({ ...tk, title: "" });
  }
  async function generate() {
    const upcoming = exams.filter((x) => daysUntil(x.date) >= 0);
    if (!upcoming.length) return setErr("Add at least one upcoming exam first so the AI can prioritise.");
    setErr("");
    const r = await run([{
      role: "user",
      content: `Today is ${todayISO()}. Create a ${ai.period === "week" ? "7-day weekly" : "single-day"} revision plan.
Available study time: ${ai.hours} hours per day.
Exams:\n${upcoming.map((x) => `- ${x.subject} ${x.paper} on ${x.date} (${daysUntil(x.date)} days away)`).join("\n")}
My priorities / weak areas: ${ai.priorities.trim() || "none given"}
Open tasks: ${tasks.filter((t) => !t.done).map((t) => t.title).join("; ") || "none"}`,
    }]);
    if (r) { setPlan(r); setEdit(false); }
  }

  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  const sortedTasks = [...tasks].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <PageHeader title="Study Planner" subtitle="Add your exams and tasks, then let the AI Task Planner build a revision schedule." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="My exams" icon={<AlarmClock />}>
          <form onSubmit={addExam} className="mb-4 grid gap-2 sm:grid-cols-[1fr_7rem_9.5rem_auto]">
            <Input aria-label="Subject" placeholder="Subject" value={ex.subject} onChange={(e) => setEx({ ...ex, subject: e.target.value })} />
            <Select value={ex.paper} onValueChange={(v) => setEx({ ...ex, paper: v })}>
              <SelectTrigger aria-label="Paper"><SelectValue /></SelectTrigger>
              <SelectContent>{["Paper 1", "Paper 2", "Paper 3", "Oral", "Practical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <Input aria-label="Exam date" type="date" value={ex.date} onChange={(e) => setEx({ ...ex, date: e.target.value })} />
            <Button type="submit" aria-label="Add exam"><Plus /></Button>
          </form>
          <p className="mb-3 text-xs text-muted-foreground">Use the dates on your official school/DBE timetable.</p>
          {sortedExams.length === 0 ? <EmptyState title="No exams yet" text="Add your first exam above." /> : (
            <ul className="space-y-2">
              {sortedExams.map((x) => {
                const d = daysUntil(x.date);
                return (
                  <li key={x.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                    <div><p className="font-semibold">{x.subject} <span className="font-normal text-muted-foreground">{x.paper}</span></p><p className="text-xs text-muted-foreground">{formatDate(x.date)} · {d < 0 ? "done" : d === 0 ? "today" : `${d} days to go`}</p></div>
                    <Button size="icon" variant="ghost" aria-label={`Delete ${x.subject} exam`} onClick={() => setExams((a) => a.filter((y) => y.id !== x.id))}><Trash2 /></Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Study tasks" icon={<CalendarCheck />}>
          <form onSubmit={addTask} className="mb-4 grid gap-2 sm:grid-cols-[1fr_8rem_9.5rem_auto]">
            <Input aria-label="Task" placeholder="e.g. Do 2019 Maths P1" value={tk.title} onChange={(e) => setTk({ ...tk, title: e.target.value })} />
            <Input aria-label="Task subject" placeholder="Subject" value={tk.subject} onChange={(e) => setTk({ ...tk, subject: e.target.value })} />
            <Input aria-label="Task date" type="date" value={tk.date} onChange={(e) => setTk({ ...tk, date: e.target.value })} />
            <Button type="submit" aria-label="Add task"><Plus /></Button>
          </form>
          {sortedTasks.length === 0 ? <EmptyState title="No tasks yet" text="Add tasks to see them on your dashboard." /> : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {sortedTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
                  <Checkbox id={`pt-${t.id}`} checked={t.done} onCheckedChange={(v) => setTasks((a) => a.map((x) => (x.id === t.id ? { ...x, done: !!v } : x)))} />
                  <label htmlFor={`pt-${t.id}`} className={`flex-1 text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>
                    {t.title}<span className="block text-xs text-muted-foreground">{t.subject && `${t.subject} · `}{formatDate(t.date)}</span>
                  </label>
                  <Button size="icon" variant="ghost" aria-label={`Delete ${t.title}`} onClick={() => setTasks((a) => a.filter((x) => x.id !== t.id))}><Trash2 /></Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="AI Task Planner" icon={<Sparkles />}>
        <div className="grid gap-3 md:grid-cols-[10rem_10rem_1fr_auto] md:items-end">
          <div className="space-y-1"><Label htmlFor="hours">Hours per day</Label>
            <Input id="hours" type="number" min={0.5} max={12} step={0.5} value={ai.hours} onChange={(e) => setAi({ ...ai, hours: e.target.value })} />
          </div>
          <div className="space-y-1"><Label>Plan length</Label>
            <Select value={ai.period} onValueChange={(v) => setAi({ ...ai, period: v })}>
              <SelectTrigger aria-label="Plan length"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="week">Weekly</SelectItem><SelectItem value="day">Daily</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label htmlFor="prio">Priorities / weak areas</Label>
            <Input id="prio" maxLength={500} placeholder="e.g. Calculus, organic chemistry" value={ai.priorities} onChange={(e) => setAi({ ...ai, priorities: e.target.value })} />
          </div>
          <Button variant="hero" onClick={generate} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate plan</Button>
        </div>
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        {error && <p role="alert" className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <div className="mt-5">
          {loading ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Building your schedule…</p>
            : plan ? (
              <div className="rounded-xl border bg-background p-4">
                <div className="mb-2 flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEdit((x) => !x)}>{edit ? "Preview" : "Edit plan"}</Button>
                  <CopyButton text={plan} />
                </div>
                {edit ? <Textarea rows={18} value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="Edit plan" /> : <Markdown>{plan}</Markdown>}
              </div>
            ) : <p className="text-sm text-muted-foreground">Your AI-generated schedule will appear here and is saved on this device.</p>}
        </div>
        <AiDisclaimer className="mt-5" />
      </Panel>
    </div>
  );
}
