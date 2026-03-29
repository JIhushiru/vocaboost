"use client";

import { useState } from "react";
import { Word } from "@/lib/types";

interface WordCardProps {
  word: Word;
  showFull?: boolean;
}

export default function WordCard({ word, showFull = false }: WordCardProps) {
  const [expanded, setExpanded] = useState(showFull);

  const categoryColors = {
    interview: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    research: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    both: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  const difficultyColors = {
    beginner: "bg-green-500/20 text-green-400",
    intermediate: "bg-yellow-500/20 text-yellow-400",
    advanced: "bg-red-500/20 text-red-400",
  };

  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent-glow)] cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            {word.word}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {word.pronunciation} · {word.partOfSpeech}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors[word.category]}`}
          >
            {word.category === "both" ? "interview & research" : word.category}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColors[word.difficulty]}`}
          >
            {word.difficulty}
          </span>
        </div>
      </div>

      <p className="text-[var(--text-secondary)] leading-relaxed">
        {word.definition}
      </p>

      {expanded && (
        <div className="mt-4 space-y-3 animate-in fade-in duration-200">
          <div className="rounded-xl bg-[var(--bg-secondary)] p-4 border-l-2 border-[var(--accent)]">
            <p className="text-sm text-[var(--text-muted)] mb-1 font-medium">
              Example
            </p>
            <p className="text-[var(--text-secondary)] italic">
              &ldquo;{word.example}&rdquo;
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-2 font-medium">
              Synonyms
            </p>
            <div className="flex flex-wrap gap-2">
              {word.synonyms.map((syn) => (
                <span
                  key={syn}
                  className="px-3 py-1 rounded-full text-sm bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]"
                >
                  {syn}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {!expanded && (
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Tap to see example & synonyms
        </p>
      )}
    </div>
  );
}
