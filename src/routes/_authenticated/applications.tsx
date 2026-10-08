import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  APP_STATUSES,
  daysUntil,
  formatDate,
  uid,
  useLocalStore,
  type Application,
  type AppStatus,
} from "@/lib/store";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "University Applications — MatricEnhle" },
      { name: "description", content: "Track South African university applications, deadlines and statuses." },
      { property: "og:title", content: "University Applications — MatricEnhle" },
      { property: "og:description", content: "Your personal university application tracker." },
    ],
  }),
  component: ApplicationsPage,
});

const empty: Omit<Application, "id"> = {
  university: "",
  programme: "",
  deadline: "",
  status: "Not Started",
  reference: "",
  website: "",
  notes: "",
};

const schema = z.object({
  university: z.string().trim().min(2, "Enter the university name").max(120),
  programme: z.string().trim().min(2, "Enter the qualification or programme").max(160),
  deadline: z.string(),
  status: z.enum(APP_STATUSES as [AppStatus, ...AppStatus[]]),
  reference: z.string().trim().max(80),
  website: z.union([z.literal(""), z.string().trim().url("Enter a full link starting with https://").max(300)]),
  notes: z.string().trim().max(2000),
});

function ApplicationsPage() {
  const [apps, setApps] = useLocalStore<Application[]>("applications", []);
  const [editing, setEditing] = useState<Application | null>(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<import("@/lib/store").FormErrors>({});
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  function openNew() {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setOpen(true);
  }
  function openEdit(a: Application) {
    setEditing(a);
    setForm(a);
    setErrors({});
    setOpen(true);
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) return setErrors(Object.fromEntries(p.error.issues.map((i) => [i.path[0], i.message])));
    if (editing) setApps((all) => all.map((a) => (a.id === editing.id ? { ...p.data, id: a.id } : a)));
    else setApps((all) => [...all, { ...p.data, id: uid() }]);
    toast.success(editing ? "Application updated" : "Application added");
    setOpen(false);
  }
  function remove(a: Application) {
    if (!confirm(`Delete ${a.university} – ${a.programme}?`)) return;
    setApps((all) => all.filter((x) => x.id !== a.id));
    toast.success("Application deleted");
  }

  const sorted = [...apps]
    .filter((a) => filter === "all" || a.status === filter)
    .sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"));
  const done = apps.filter((a) => ["Submitted", "Awaiting Response", "Accepted"].includes(a.status)).length;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <PageHeader
        title="University Applications"
        subtitle="Keep track of every application in one place. MatricEnhle doesn't submit applications — apply on each university's official website."
        action={<Button variant="hero" onClick={openNew}><Plus /> Add application</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Panel><p className="text-sm text-muted-foreground">Total tracked</p><p className="text-3xl font-bold">{apps.length}</p></Panel>
        <Panel><p className="text-sm text-muted-foreground">Submitted or further</p><p className="text-3xl font-bold">{done}</p></Panel>
        <Panel>
          <p className="text-sm text-muted-foreground">Overall progress</p>
          <p className="mb-2 text-3xl font-bold">{apps.length ? Math.round((done / apps.length) * 100) : 0}%</p>
          <Progress value={apps.length ? (done / apps.length) * 100 : 0} />
        </Panel>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {["all", ...APP_STATUSES].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} aria-pressed={filter === s}>
            {s === "all" ? "All" : s}
          </Button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title={apps.length ? "No applications with this status" : "No applications yet"}
          text="Add a university and programme to start tracking. Example: University of Pretoria — BSc Computer Science (verify real deadlines on the official site)."
        >
          <Button onClick={openNew}><Plus /> Add your first application</Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((a) => {
            const d = daysUntil(a.deadline);
            return (
              <article key={a.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">{a.university}</h2>
                    <p className="truncate text-sm text-muted-foreground">{a.programme}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Deadline</dt>
                    <dd className="font-semibold">
                      {formatDate(a.deadline)}
                      {a.deadline && a.status !== "Accepted" && (
                        <span className={d < 0 ? "ml-1 text-destructive" : d <= 14 ? "ml-1 text-warning" : "ml-1 text-teal"}>
                          ({d < 0 ? "passed" : d === 0 ? "today" : `${d}d`})
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Reference</dt>
                    <dd className="truncate font-semibold">{a.reference || "—"}</dd>
                  </div>
                </dl>
                {a.notes && <p className="mt-3 line-clamp-3 rounded-lg bg-muted/60 p-2 text-sm">{a.notes}</p>}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  <Select
                    value={a.status}
                    onValueChange={(v) => setApps((all) => all.map((x) => (x.id === a.id ? { ...x, status: v as AppStatus } : x)))}
                  >
                    <SelectTrigger className="h-8 w-44" aria-label="Change status"><SelectValue /></SelectTrigger>
                    <SelectContent>{APP_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  {a.website && (
                    <Button asChild size="sm" variant="outline">
                      <a href={a.website} target="_blank" rel="noopener noreferrer"><ExternalLink /> Official site</a>
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" aria-label={`Edit ${a.university}`} onClick={() => openEdit(a)}><Pencil /></Button>
                  <Button size="icon" variant="ghost" aria-label={`Delete ${a.university}`} onClick={() => remove(a)} className="text-destructive"><Trash2 /></Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit application" : "Add application"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3" noValidate>
            {([
              ["university", "University", "e.g. University of Cape Town"],
              ["programme", "Qualification / programme", "e.g. BCom Accounting"],
            ] as const).map(([k, l, ph]) => (
              <div key={k} className="space-y-1">
                <Label htmlFor={k}>{l}</Label>
                <Input id={k} placeholder={ph} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} />
                {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
              </div>
            ))}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" value={form.deadline} onChange={set("deadline")} />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as AppStatus }))}>
                  <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                  <SelectContent>{APP_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="reference">Reference / applicant number</Label>
              <Input id="reference" value={form.reference} onChange={set("reference")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="website">Official application website</Label>
              <Input id="website" placeholder="Paste the link from the university's official site" value={form.website} onChange={set("website")} aria-invalid={!!errors.website} />
              {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} placeholder="Documents still needed, APS score, contact person…" value={form.notes} onChange={set("notes")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero">{editing ? "Save changes" : "Add application"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
