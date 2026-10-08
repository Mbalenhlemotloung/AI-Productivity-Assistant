import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";

/** Per-user localStorage state. Data stays on this device only. */
export function useLocalStore<T>(key: string, initial: T) {
  const { user } = useAuth();
  const fullKey = `matricenhle:${user?.id ?? "anon"}:${key}`;
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      setValue(raw ? (JSON.parse(raw) as T) : initial);
    } catch {
      setValue(initial);
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(fullKey, JSON.stringify(v));
        } catch {
          /* storage full or blocked */
        }
        return v;
      });
    },
    [fullKey],
  );

  return [value, update, loaded] as const;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export type AppStatus = "Not Started" | "In Progress" | "Submitted" | "Awaiting Response" | "Accepted";
export const APP_STATUSES: AppStatus[] = [
  "Not Started",
  "In Progress",
  "Submitted",
  "Awaiting Response",
  "Accepted",
];

export interface Application {
  id: string;
  university: string;
  programme: string;
  deadline: string;
  status: AppStatus;
  reference: string;
  website: string;
  notes: string;
}

export interface Exam {
  id: string;
  subject: string;
  paper: string;
  date: string;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  date: string;
  done: boolean;
}

export interface SubjectProgress {
  id: string;
  subject: string;
  progress: number;
}

export function daysUntil(date: string) {
  if (!date) return Infinity;
  const d = new Date(date + "T00:00:00");
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export function formatDate(date: string) {
  if (!date) return "—";
  return new Date(date + "T00:00:00").toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
