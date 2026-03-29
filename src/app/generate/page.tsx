"use client";

import { useState } from "react";
import { Word } from "@/lib/types";

export default function GeneratePage() {
  const [category, setCategory] = useState<"interview" | "research" | "both">(
    "both"
  );
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    added: number;
    total: number;
    words: Word[];
  } | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, topic: topic.trim(), count }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate words");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not connect to the server. Make sure Claude CLI is installed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Generate Words</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Use Claude to generate new vocabulary words tailored to your needs.
      </p>

      <div className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-3">
            Category
          </label>
          <div className="flex gap-2">
            {(["interview", "research", "both"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === c
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)]"
                }`}
              >
                {c === "both"
                  ? "Both"
                  : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-3">
            Topic (optional)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. machine learning, leadership, statistics..."
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
          />
        </div>

        {/* Count */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-3">
            Number of Words
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  count === n
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all ${
            loading
              ? "bg-[var(--bg-card)] text-[var(--text-muted)] cursor-wait"
              : "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80 shadow-lg shadow-[var(--accent)]/20"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block w-5 h-5 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
              Generating with Claude...
            </span>
          ) : (
            "Generate Words"
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <p className="font-medium mb-1">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
              <p className="font-medium">
                Added {result.added} new words! ({result.total} total generated
                words)
              </p>
            </div>

            <div className="space-y-3">
              {result.words.map((word) => (
                <div
                  key={word.id}
                  className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {word.word}
                      </span>
                      <span className="ml-2 text-sm text-[var(--text-muted)]">
                        {word.pronunciation} · {word.partOfSpeech}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        word.difficulty === "beginner"
                          ? "bg-green-500/20 text-green-400"
                          : word.difficulty === "intermediate"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {word.difficulty}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm">
                    {word.definition}
                  </p>
                  <p className="text-[var(--text-muted)] text-sm mt-2 italic">
                    &ldquo;{word.example}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
