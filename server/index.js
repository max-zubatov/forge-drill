import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import cors from "cors";
import { Langfuse } from "langfuse";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env"), override: true });

const app = express();
const PORT = 3001;

// Langfuse is optional — only initialised when keys are present
const langfuse =
  process.env.LANGFUSE_SECRET_KEY && process.env.LANGFUSE_PUBLIC_KEY
    ? new Langfuse({
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        baseUrl: process.env.LANGFUSE_BASE_URL ?? "https://cloud.langfuse.com",
        flushAt: 1, // send each event immediately in dev
      })
    : null;

if (langfuse) {
  console.log("Langfuse observability enabled");
}

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

app.post("/api/claude", async (req, res) => {
  const { system, user, returnJson, traceName, metadata } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  }

  // Start a Langfuse trace for this request
  const trace = langfuse?.trace({
    name: traceName ?? "claude-call",
    metadata: metadata ?? {},
  });

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
      await langfuse?.flushAsync();
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
      await langfuse?.flushAsync();
      return res.json({ text });
    }

    const stripped = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const json = JSON.parse(stripped);

      // For evaluation calls, push the rubric score back to Langfuse
      if (trace && json.overall_score != null) {
        trace.score({
          name: "overall_score",
          value: json.overall_score / 10, // normalise to 0–1
          comment: json.verdict ?? undefined,
        });
        for (const row of json.rubric ?? []) {
          trace.score({
            name: row.category.toLowerCase().replace(/\s+/g, "_"),
            value: row.score / 5, // normalise to 0–1
            comment: row.note ?? undefined,
          });
        }
      }

      await langfuse?.flushAsync();
      return res.json({ text, json });
    } catch {
      await langfuse?.flushAsync();
      return res.status(502).json({ error: "Failed to parse JSON from model", raw: text });
    }
  } catch (err) {
    generation?.end({ output: String(err), level: "ERROR" });
    await langfuse?.flushAsync();
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Forge Drill proxy running on http://localhost:${PORT}`);
});
