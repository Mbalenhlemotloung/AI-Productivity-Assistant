import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, FileDown, Search } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/past-papers")({
  head: () => ({
    meta: [
      { title: "Past Papers — MatricEnhle" },
      { name: "description", content: "Browse NSC matric past papers by subject, year and paper type." },
      { property: "og:title", content: "Past Papers — MatricEnhle" },
      { property: "og:description", content: "Matric past-paper library with search and filters." },
    ],
  }),
  component: PastPapersPage,
});

/**
 * Add real papers here. Each entry needs a working `url` to a file in /public/papers
 * or an official source. No placeholder downloads are listed.
 */
interface Paper {
  subject: string;
  year: number;
  type: "Paper 1" | "Paper 2" | "Paper 3" | "Memo";
  url: string;
}
const PAPERS: Paper[] = [];

const SUBJECTS = [
  "Mathematics", "Mathematical Literacy", "Physical Sciences", "Life Sciences", "Accounting",
  "Business Studies", "Economics", "Geography", "History", "English Home Language",
  "English First Additional Language", "isiZulu", "Afrikaans", "Information Technology",
];
const YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 1 - i);
const TYPES = ["Paper 1", "Paper 2", "Paper 3", "Memo"];

function PastPapersPage() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("all");
  const [year, setYear] = useState("all");
  const [type, setType] = useState("all");

  const results = useMemo(
    () =>
      PAPERS.filter(
        (p) =>
          (subject === "all" || p.subject === subject) &&
          (year === "all" || String(p.year) === year) &&
          (type === "all" || p.type === type) &&
          p.subject.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, subject, year, type],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Past Papers" subtitle="Practise with previous NSC exam papers and memos." />

      <Panel>
        <div className="grid gap-3 md:grid-cols-[1fr_repeat(3,11rem)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input aria-label="Search papers" placeholder="Search by subject…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger aria-label="Subject"><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All subjects</SelectItem>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger aria-label="Year"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger aria-label="Paper type"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All types</SelectItem>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </Panel>

      {results.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <article key={p.url} className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-soft">
              <div><p className="font-semibold">{p.subject}</p><p className="text-sm text-muted-foreground">{p.year} · {p.type}</p></div>
              <Button asChild size="sm"><a href={p.url} target="_blank" rel="noopener noreferrer"><FileDown /> Open</a></Button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={PAPERS.length ? "No papers match your filters" : "No papers have been added to the library yet"}
          text={
            PAPERS.length
              ? "Try a different subject, year or paper type."
              : "To keep things honest we don't list fake downloads. Official NSC past papers and memos are published by the Department of Basic Education. Your teacher or school admin can add files to this library."
          }
        >
          <Button asChild variant="hero">
            <a href="https://www.education.gov.za/" target="_blank" rel="noopener noreferrer">
              <BookOpen /> Find papers on the official DBE website <ExternalLink />
            </a>
          </Button>
        </EmptyState>
      )}
    </div>
  );
}
