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
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }

  return data as ClaudeResponse;
}
