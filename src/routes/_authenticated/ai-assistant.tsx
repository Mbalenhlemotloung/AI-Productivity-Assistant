import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Mail, MessageCircle, Send, Trash2 } from "lucide-react";
import { useAi } from "@/lib/use-ai";
import { AiDisclaimer, CopyButton, Markdown, PageHeader, Panel } from "@/components/shared";
import { Mascot } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/ai-assistant")({
  head: () => ({
    meta: [
      { title: "AI Study Assistant — MatricEnhle" },
      { name: "description", content: "Ask MatricEnhle, summarise notes and write emails with AI." },
      { property: "og:title", content: "AI Study Assistant — MatricEnhle" },
      { property: "og:description", content: "AI-powered study help for matric learners." },
    ],
  }),
  component: AiPage,
});

function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>;
}

function AiPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="AI Study Assistant" subtitle="Real AI help for understanding, summarising and writing — the AI Task Planner lives in the Study Planner." />
      <AiDisclaimer />
      <Tabs defaultValue="chat">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="chat"><MessageCircle className="mr-1.5 h-4 w-4" />Ask MatricEnhle</TabsTrigger>
          <TabsTrigger value="summarise"><FileText className="mr-1.5 h-4 w-4" />Notes Summariser</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-1.5 h-4 w-4" />Email Generator</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="mt-4"><Chat /></TabsContent>
        <TabsContent value="summarise" className="mt-4"><Summariser /></TabsContent>
        <TabsContent value="email" className="mt-4"><EmailGen /></TabsContent>
      </Tabs>
    </div>
  );
}

type Msg = { role: "user" | "assistant"; content: string };

function Chat() {
  const { run, loading, error } = useAi("chat");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [msgs, loading]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    if (q.length > 2000) return;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    const ans = await run(next.slice(-20));
    if (ans) setMsgs([...next, { role: "assistant", content: ans }]);
  }

  return (
    <Panel className="flex h-[min(70vh,640px)] flex-col p-0">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <p className="font-semibold">Ask MatricEnhle</p>
        {msgs.length > 0 && <Button size="sm" variant="ghost" onClick={() => setMsgs([])}><Trash2 /> Clear</Button>}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-5" aria-live="polite">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
            <Mascot className="mb-3 h-20 w-20" />
            <p className="font-semibold text-foreground">Ask me any matric study question</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {["Explain Newton's second law with an example", "How do I factorise a quadratic?", "What is photosynthesis in simple words?"].map((s) => (
                <button key={s} onClick={() => setInput(s)} className="rounded-full border bg-card px-3 py-1.5 text-xs hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={m.role === "user" ? "max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-primary px-4 py-2.5 text-sm text-primary-foreground" : "max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5"}>
              {m.role === "user" ? m.content : <Markdown>{m.content}</Markdown>}
            </div>
          </div>
        ))}
        {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</p>}
        <ErrorNote error={error} />
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t p-3">
        <Input aria-label="Your question" maxLength={2000} placeholder="Type your question or a follow-up…" value={input} onChange={(e) => setInput(e.target.value)} />
        <Button type="submit" variant="hero" disabled={loading || !input.trim()} aria-label="Send"><Send /></Button>
      </form>
    </Panel>
  );
}

function Summariser() {
  const { run, loading, error } = useAi("summarise");
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (notes.trim().length < 50) return setV("Paste at least 50 characters of notes.");
    setV("");
    const r = await run([{ role: "user", content: `Here are my study notes:\n\n${notes.trim()}` }]);
    if (r) { setOut(r); setEdit(false); }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Your notes">
        <form onSubmit={go} className="space-y-3">
          <Label htmlFor="notes" className="sr-only">Notes</Label>
          <Textarea id="notes" rows={14} maxLength={10000} placeholder="Paste notes, a textbook section or an article…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{notes.length}/10000</span></div>
          {v && <p className="text-xs text-destructive">{v}</p>}
          <ErrorNote error={error} />
          <Button type="submit" variant="hero" disabled={loading} className="w-full">{loading && <Loader2 className="animate-spin" />} Summarise with AI</Button>
        </form>
      </Panel>
      <Panel title="AI summary" action={out && (
        <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => setEdit((x) => !x)}>{edit ? "Preview" : "Edit"}</Button><CopyButton text={out} /></div>
      )}>
        {loading ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Reading your notes…</p>
          : !out ? <p className="text-sm text-muted-foreground">Your summary, key points, simple explanations, revision tips, action items and dates will appear here.</p>
          : edit ? <Textarea rows={18} value={out} onChange={(e) => setOut(e.target.value)} aria-label="Edit summary" />
          : <Markdown>{out}</Markdown>}
      </Panel>
    </div>
  );
}

function EmailGen() {
  const { run, loading, error } = useAi("email");
  const [f, setF] = useState({ recipient: "University admissions office", tone: "Formal", purpose: "", details: "", name: "" });
  const [out, setOut] = useState("");
  const [v, setV] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (f.purpose.trim().length < 10) return setV("Describe the purpose of your email (at least 10 characters).");
    setV("");
    const r = await run([{ role: "user", content: `Recipient: ${f.recipient}\nTone: ${f.tone}\nPurpose: ${f.purpose}\nExtra details: ${f.details || "none"}\nSign off as: ${f.name || "[Your name]"}` }]);
    if (r) setOut(r);
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Email details">
        <form onSubmit={go} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label>Recipient</Label>
              <Select value={f.recipient} onValueChange={(x) => setF({ ...f, recipient: x })}>
                <SelectTrigger aria-label="Recipient"><SelectValue /></SelectTrigger>
                <SelectContent>{["University admissions office", "Lecturer", "Student support / financial aid office", "Residence office", "Teacher"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Tone</Label>
              <Select value={f.tone} onValueChange={(x) => setF({ ...f, tone: x })}>
                <SelectTrigger aria-label="Tone"><SelectValue /></SelectTrigger>
                <SelectContent>{["Formal", "Friendly", "Persuasive"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1"><Label htmlFor="purpose">What is the email about?</Label>
            <Textarea id="purpose" rows={3} maxLength={1000} placeholder="e.g. Ask about the status of my BSc application" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} />
          </div>
          <div className="space-y-1"><Label htmlFor="details">Extra details (optional)</Label>
            <Textarea id="details" rows={3} maxLength={1500} placeholder="Programme name, dates, what you've already tried… (no ID numbers)" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} />
          </div>
          <div className="space-y-1"><Label htmlFor="name">Your name</Label>
            <Input id="name" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          {v && <p className="text-xs text-destructive">{v}</p>}
          <ErrorNote error={error} />
          <Button type="submit" variant="hero" disabled={loading} className="w-full">{loading && <Loader2 className="animate-spin" />} Generate email</Button>
        </form>
      </Panel>
      <Panel title="Your email" action={out && <CopyButton text={out} />}>
        {loading ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Writing…</p>
          : out ? <Textarea rows={18} value={out} onChange={(e) => setOut(e.target.value)} aria-label="Generated email (editable)" />
          : <p className="text-sm text-muted-foreground">Your editable email will appear here. Replace anything in [brackets] before sending.</p>}
      </Panel>
    </div>
  );
}
