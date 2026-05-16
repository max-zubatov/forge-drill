# The Forge Drill

Python OOP interview practice app for the Forge Forward Deployed Engineer role.

## Setup

```bash
# 1. Add your Anthropic API key
cp .env.example server/.env
# edit server/.env and set ANTHROPIC_API_KEY=sk-...

# 2. Install all dependencies
npm install
npm install --prefix server
npm install --prefix client

# 3. Start both servers
npm run dev
```

Open http://localhost:5173

## Usage

1. Pick a problem from the sidebar
2. Start the timer
3. Write your Python solution in the Monaco editor
4. Hit **Evaluate** to get a structured rubric (scored 1–10)
5. Use **Hint** if you're stuck (no spoilers)
6. Use **Sample Solution** only after attempting (gated behind a confirm)

Progress is saved per-problem in localStorage — scores, attempt count, and last-attempted time appear in the sidebar.
