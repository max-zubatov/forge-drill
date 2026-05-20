# The Forge Drill — Setup Instructions

A local web app for practicing Python OOP interview problems with AI-powered evaluation.

## Requirements

- Node.js 18+
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

## Setup

**1. Clone the repo**
```bash
git clone https://github.com/max-zubatov/forge-drill.git
cd forge-drill
```

**2. Install dependencies**
```bash
npm install
```

**3. Add your API key**

Create a file at `server/.env`:
```
ANTHROPIC_API_KEY=your-key-here
```

**4. Start the app**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How to use it

1. Pick a problem from the left sidebar
2. Start the timer and write your Python solution in the editor
3. Hit **Run** to execute your code in the browser
4. Hit **Evaluate** when ready — you'll get a structured rubric scored by Claude
5. Use **Hint** if you're stuck, or **Sample Solution** to see a reference implementation

Your code and scores are saved automatically in the browser between sessions.

---

## Optional: cloud database (Supabase)

By default the app stores everything in your browser's localStorage — no database needed. If you'd like scores and code to persist across devices or browsers, connect a free Supabase project. The server will create the required tables automatically on first startup.

**1.** Create a free project at [supabase.com](https://supabase.com)

**2.** Create a Personal Access Token at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)

**3.** Add the following to `server/.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ACCESS_TOKEN=your-personal-access-token
```

**4.** Add the following to `client/.env.local` (create this file in the `client/` folder):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

The `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `VITE_SUPABASE_PUBLISHABLE_KEY` are all found in your Supabase dashboard under **Project Settings → API**.

**5.** Restart `npm run dev` — you'll see `Supabase: tables ready ✓` in the server console confirming the database is set up.

If any keys are missing, the app falls back to localStorage silently — nothing will break.
