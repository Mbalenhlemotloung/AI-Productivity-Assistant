import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Streams a Responses call server-side and returns the final text. */
export async function runAi(instructions: string, messages: ModelMessage[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError("AI is not configured for this app yet.", 500);

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      if (!res.ok) {
        let msg = "The AI service returned an error.";
        try {
          const body = (await res.clone().json()) as { message?: string; error?: { message?: string } };
          msg = body.message ?? body.error?.message ?? msg;
        } catch {
          /* ignore */
        }
        if (res.status === 429) msg = "Too many requests right now — please wait a moment and try again.";
        if (res.status === 402) msg = `AI credits have run out. ${msg}`;
        throw new AiError(msg, res.status);
      }
      return res;
    },
  });

  let captured: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    messages,
    maxRetries: 0,
    onError: ({ error }) => {
      captured = error;
    },
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  let text = "";
  try {
    text = await result.text;
  } catch (e) {
    captured ??= e;
  }
  if (captured) {
    const err = captured as { status?: number; statusCode?: number; message?: string; cause?: unknown };
    if (captured instanceof AiError) throw captured;
    if (err.cause instanceof AiError) throw err.cause;
    throw new AiError(err.message ?? "AI request failed.", err.statusCode ?? err.status ?? 500);
  }
  if (!text.trim()) throw new AiError("The AI did not return an answer. Please try again.", 502);
  return text.trim();
}
