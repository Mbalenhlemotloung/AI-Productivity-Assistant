import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
  icon,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-soft", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            {icon && <span className="text-primary [&_svg]:size-5">{icon}</span>}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/50 p-6 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-foreground",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
      <p>
        <strong>Use AI responsibly.</strong> AI answers can be inaccurate or out of date. Always check
        important information with your teachers and official university or NSFAS sources. Do not enter
        confidential personal information (ID numbers, passwords, banking or family income details).
      </p>
    </div>
  );
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-ai text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Couldn't copy — please select the text and copy manually.");
        }
      }}
    >
      {done ? <Check /> : <Copy />} {done ? "Copied" : label}
    </Button>
  );
}

export const STATUS_STYLES: Record<string, string> = {
  "Not Started": "bg-muted text-muted-foreground",
  "In Progress": "bg-warning-soft text-warning",
  Submitted: "bg-secondary text-secondary-foreground",
  "Awaiting Response": "bg-accent text-accent-foreground",
  Accepted: "bg-success-soft text-success",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLES[status])}>
      {status}
    </span>
  );
}
