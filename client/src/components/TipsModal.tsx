type Props = { onClose: () => void };

const TIPS = [
  {
    title: "First 5 minutes",
    body: "Restate the problem. Ask: input format, output format, empty input, malformed input, duplicates, case sensitivity, required vs nice-to-have. At Forge specifically, the clarifying questions are being graded — discovery is part of the job.",
  },
  {
    title: "Build incrementally",
    body: "Get the simplest end-to-end version working first. Print intermediate state. Don't write the whole thing then run at the end.",
  },
  {
    title: "Class design heuristics",
    items: [
      "One class per noun in the problem; verbs become methods on the natural owner",
      "If a class has only static-ish methods, it probably shouldn't be a class",
      "Inject dependencies (like now) rather than calling them inside — testable code reads as senior",
      "Use @dataclass for value-shaped objects; regular classes when behavior dominates",
      'Prefer composition over inheritance unless there\'s a real "is-a" relationship',
    ],
  },
  {
    title: "Extensibility signals",
    body: 'Interviewers extend the problem mid-flight ("now also handle X"). Long if/elif chains on type → bad. Dispatch tables or polymorphism → good.',
  },
  {
    title: "Talk while you type",
    body: "Silence is the worst-graded behavior. Narrate tradeoffs.",
  },
  {
    title: "Last 5 minutes",
    body: "Stop adding features. Walk edge cases out loud. Mention what you'd do with more time.",
  },
];

export default function TipsModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-forge-surface border border-forge-border w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-forge-border sticky top-0 bg-forge-surface z-10">
          <h2 className="font-serif text-lg tracking-tight text-forge-text">
            Interview Tips
          </h2>
          <button
            onClick={onClose}
            className="text-forge-muted hover:text-forge-subtext text-sm transition-colors"
          >
            Close
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-6">
          {TIPS.map((tip) => (
            <div key={tip.title}>
              <div className="label mb-2">{tip.title}</div>
              {tip.body && (
                <p className="text-sm text-forge-subtext leading-relaxed">
                  {tip.body}
                </p>
              )}
              {tip.items && (
                <ul className="flex flex-col gap-1.5 mt-1">
                  {tip.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-forge-subtext">
                      <span className="text-forge-muted shrink-0 mt-0.5">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
