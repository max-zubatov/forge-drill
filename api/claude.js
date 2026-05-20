// Vercel serverless function — mirrors server/index.js endpoint
// Environment variables are set in the Vercel dashboard (Settings → Environment Variables)
import { Langfuse } from "langfuse";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { system, user, returnJson, traceName, metadata } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  }

  // Langfuse is optional
  let langfuse = null;
  if (process.env.LANGFUSE_SECRET_KEY && process.env.LANGFUSE_PUBLIC_KEY) {
    langfuse = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL ?? "https://cloud.langfuse.com",
      flushAt: 1,
    });
  }

  const trace = langfuse?.trace({ name: traceName ?? "claude-call", metadata: metadata ?? {} });
  const generation = trace?.generation({
    name: "anthropic-messages",
    model: "claude-sonnet-4-5",
    input: { system, messages: [{ role: "user", content: user }] },
    startTime: new Date(),
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      generation?.end({ output: err, level: "ERROR" });
      await langfuse?.flushAsync().catch(() => {});
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const usage = data.usage ?? {};

    generation?.end({
      output: text,
      usage: {
        input: usage.input_tokens,
        output: usage.output_tokens,
        total: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
      },
    });

    if (!returnJson) {
      await langfuse?.flushAsync().catch(() => {});
      return res.json({ text });
    }

    const stripped = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const json = JSON.parse(stripped);

      if (trace && json.overall_score != null) {
        trace.score({ name: "overall_score", value: json.overall_score / 10, comment: json.verdict });
        for (const row of json.rubric ?? []) {
          trace.score({
            name: row.category.toLowerCase().replace(/\s+/g, "_"),
            value: row.score / 5,
            comment: row.note,
          });
        }
      }

      await langfuse?.flushAsync().catch(() => {});
      return res.json({ text, json });
    } catch {
      await langfuse?.flushAsync().catch(() => {});
      return res.status(502).json({ error: "Failed to parse JSON from model", raw: text });
    }
  } catch (err) {
    generation?.end({ output: String(err), level: "ERROR" });
    await langfuse?.flushAsync().catch(() => {});
    return res.status(500).json({ error: String(err) });
  }
}
