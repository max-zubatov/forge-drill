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
