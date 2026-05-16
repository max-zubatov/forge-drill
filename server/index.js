import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

app.post("/api/claude", async (req, res) => {
  const { system, user, returnJson } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  }

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
        max_tokens: 2000,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    if (!returnJson) {
      return res.json({ text });
    }

    const stripped = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const json = JSON.parse(stripped);
      return res.json({ text, json });
    } catch {
      return res.status(502).json({ error: "Failed to parse JSON from model", raw: text });
    }
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Forge Drill proxy running on http://localhost:${PORT}`);
});
