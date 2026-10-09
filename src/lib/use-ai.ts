import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAi } from "./ai.functions";

type Msg = { role: "user" | "assistant"; content: string };

export function useAi(feature: "planner" | "summarise" | "meeting" | "chat" | "email") {
  const call = useServerFn(askAi);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(messages: Msg[]): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await call({ data: { feature, messages } });
      if (!res.ok) {
        setError(res.error);
        return null;
      }
      return res.text;
    } catch {
      setError("Couldn't reach the AI service. Check your connection and try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }
  return { run, loading, error };
}
