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

By default the app stores everything in your browser's localStorage — no database needed. If you'd like scores and code to persist across devices or browsers, you can connect a free Supabase project.

**1.** Create a free project at [supabase.com](https://supabase.com)

**2.** Add your keys — both files are in the root of the project:

`server/.env`
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`client/.env.local`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

All values are in your Supabase dashboard under **Project Settings → API**.

**3.** Restart `npm run dev` — the server will automatically create the required tables on startup. No SQL to run manually.

If the keys are absent, the app falls back to localStorage silently.
