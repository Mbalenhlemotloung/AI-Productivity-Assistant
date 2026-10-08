import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlarmClock,
  BellRing,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  HandCoins,
  Sparkles,
} from "lucide-react";
import { displayName, useAuth } from "@/lib/auth";
import {
  APP_STATUSES,
  daysUntil,
  formatDate,
  todayISO,
  useLocalStore,
  type Application,
  type Exam,
  type SubjectProgress,
  type Task,
} from "@/lib/store";
import { Mascot, StarField } from "@/components/brand";
import { EmptyState, Panel, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MatricEnhle" },
      { name: "description", content: "Your exam countdowns, application deadlines and study tasks at a glance." },
      { property: "og:title", content: "Dashboard — MatricEnhle" },
      { property: "og:description", content: "Your matric-to-university overview." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [exams] = useLocalStore<Exam[]>("exams", []);
  const [apps] = useLocalStore<Application[]>("applications", []);
  const [tasks, setTasks] = useLocalStore<Task[]>("tasks", []);
  const [subjects] = useLocalStore<SubjectProgress[]>("subjects", []);

  const upcomingExams = exams.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const upcomingDeadlines = apps
    .filter((a) => a.deadline && daysUntil(a.deadline) >= 0 && a.status !== "Accepted")
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const today = todayISO();
  const todayTasks = tasks.filter((t) => t.date === today);
  const avg = subjects.length ? Math.round(subjects.reduce((s, x) => s + x.progress, 0) / subjects.length) : 0;
  const alerts = [
    ...upcomingDeadlines.filter((a) => daysUntil(a.deadline) <= 14).map((a) => ({
      id: a.id,
      text: `${a.university} application due ${daysUntil(a.deadline) === 0 ? "today" : `in ${daysUntil(a.deadline)} days`}`,
    })),
    ...upcomingExams.filter((e) => daysUntil(e.date) <= 7).map((e) => ({
      id: e.id,
      text: `${e.subject} ${e.paper} exam ${daysUntil(e.date) === 0 ? "today" : `in ${daysUntil(e.date)} days`}`,
    })),
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-hero p-6 text-plum-foreground shadow-glow sm:p-8">
        <StarField />
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-plum-foreground/70">Hi {displayName(user)} 👋</p>
            <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Your future starts here ✨</h1>
            <p className="mt-2 max-w-lg text-plum-foreground/80">
              {todayTasks.filter((t) => !t.done).length} study tasks today · {upcomingExams.length} upcoming exams ·{" "}
              {upcomingDeadlines.length} open application deadlines
            </p>
          </div>
          <Mascot float className="hidden h-32 w-32 shrink-0 drop-shadow-2xl sm:block" />
        </div>
      </section>

      <div role="region" aria-label="Notifications" aria-live="polite">
        {alerts.length > 0 ? (
          <div className="rounded-2xl border border-accent-foreground/20 bg-accent p-4">
            <p className="mb-2 flex items-center gap-2 font-semibold text-accent-foreground">
              <BellRing className="h-4 w-4" /> Important deadlines
            </p>
            <ul className="space-y-1 text-sm">
              {alerts.map((a) => <li key={a.id}>• {a.text}</li>)}
            </ul>
          </div>
        ) : (
          <p className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
            <BellRing className="h-4 w-4 text-teal" /> No urgent deadlines in the next two weeks.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/applications", label: "Applications", icon: GraduationCap },
          { to: "/nsfas", label: "NSFAS Support", icon: HandCoins },
          { to: "/past-papers", label: "Past Papers", icon: BookOpen },
          { to: "/ai-assistant", label: "AI Tools", icon: Sparkles },
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-soft text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-semibold group-hover:text-primary">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming exams" icon={<AlarmClock />} action={<Button asChild variant="ghost" size="sm"><Link to="/planner">Manage</Link></Button>}>
          {upcomingExams.length === 0 ? (
            <EmptyState title="No exams added yet" text="Add your exam dates from your official timetable to see countdowns.">
              <Button asChild size="sm"><Link to="/planner">Add exams</Link></Button>
            </EmptyState>
          ) : (
            <ul className="space-y-2">
              {upcomingExams.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2.5">
                  <div>
                    <p className="font-semibold">{e.subject} <span className="font-normal text-muted-foreground">{e.paper}</span></p>
                    <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                  </div>
                  <span className="rounded-full bg-gradient-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {daysUntil(e.date) === 0 ? "Today" : `${daysUntil(e.date)}d`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Application deadlines" icon={<GraduationCap />} action={<Button asChild variant="ghost" size="sm"><Link to="/applications">View all</Link></Button>}>
          {upcomingDeadlines.length === 0 ? (
            <EmptyState title="No deadlines tracked" text="Add the universities you're applying to and their deadlines.">
              <Button asChild size="sm"><Link to="/applications">Add application</Link></Button>
            </EmptyState>
          ) : (
            <ul className="space-y-2">
              {upcomingDeadlines.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{a.university}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.programme} · {formatDate(a.deadline)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Today's study tasks" icon={<CalendarCheck />} action={<Button asChild variant="ghost" size="sm"><Link to="/planner">Planner</Link></Button>}>
          {todayTasks.length === 0 ? (
            <EmptyState title="Nothing planned for today" text="Add tasks in the Study Planner or generate a plan with AI." />
          ) : (
            <ul className="space-y-2">
              {todayTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
                  <Checkbox
                    id={`t-${t.id}`}
                    checked={t.done}
                    onCheckedChange={(v) => setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, done: !!v } : x)))}
                  />
                  <label htmlFor={`t-${t.id}`} className={t.done ? "text-muted-foreground line-through" : ""}>
                    {t.title} {t.subject && <span className="text-xs text-muted-foreground">· {t.subject}</span>}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Progress overview" icon={<Sparkles />} action={<Button asChild variant="ghost" size="sm"><Link to="/progress">Details</Link></Button>}>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm"><span>Average subject readiness</span><strong>{avg}%</strong></div>
              <Progress value={avg} />
            </div>
            <div>
              <p className="mb-2 text-sm">Applications by status</p>
              <div className="flex flex-wrap gap-2">
                {APP_STATUSES.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 text-xs">
                    <StatusBadge status={s} /> {apps.filter((a) => a.status === s).length}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
