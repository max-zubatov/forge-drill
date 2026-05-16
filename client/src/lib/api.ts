export type ClaudeRequest = {
  system: string;
  user: string;
  returnJson?: boolean;
};

export type ClaudeResponse = {
  text: string;
  json?: unknown;
};

export async function callClaude(req: ClaudeRequest): Promise<ClaudeResponse> {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });

  const data = await res.json();

  if (!res.ok) {
    const detail = data.raw ? `${data.error} — raw response: ${data.raw.slice(0, 300)}` : data.error;
    throw new Error(detail ?? `HTTP ${res.status}`);
  }

  return data as ClaudeResponse;
}
