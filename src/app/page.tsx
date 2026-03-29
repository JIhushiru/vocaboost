"use client";

import { useEffect, useState } from "react";
import { Word } from "@/lib/types";
import { getDailyWords, getStats, getProgress } from "@/lib/storage";
import { getAllWords } from "@/lib/words-loader";
import WordCard from "@/components/WordCard";

export default function DailyPage() {
  const [dailyWords, setDailyWords] = useState<Word[]>([]);
  const [streak, setStreak] = useState(0);
  const [filter, setFilter] = useState<"all" | "interview" | "research">("all");

  useEffect(() => {
    getAllWords().then((allWords) => {
      const ids = getDailyWords(
        allWords.map((w) => w.id),
        8
      );
      const selected = ids
        .map((id) => allWords.find((w) => w.id === id))
        .filter(Boolean) as Word[];
      setDailyWords(selected);
    });

    const stats = getStats();
    setStreak(stats.streak);
  }, []);

  const filteredWords = dailyWords.filter(
    (w) => filter === "all" || w.category === filter || w.category === "both"
  );

  const progress = typeof window !== "undefined" ? getProgress() : {};
  const learnedCount = Object.values(progress).filter(
    (p) => p.level >= 3
  ).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Today&apos;s Words</h1>
          {streak > 0 && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {streak} day streak
            </span>
          )}
        </div>
        <p className="text-[var(--text-secondary)]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          {" · "}
          <span className="text-[var(--accent-light)]">{learnedCount}</span>{" "}
          words mastered
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "interview", "research"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)]"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Word List */}
      <div className="space-y-4">
        {filteredWords.map((word) => (
          <WordCard key={word.id} word={word} />
        ))}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-lg">No words for this filter today.</p>
          <p className="text-sm mt-1">Try selecting a different category.</p>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <a
          href="/flashcards"
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all"
        >
          <span className="text-2xl">🗂</span>
          <span className="text-sm text-[var(--text-secondary)]">
            Practice Flashcards
          </span>
        </a>
        <a
          href="/quiz"
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all"
        >
          <span className="text-2xl">✎</span>
          <span className="text-sm text-[var(--text-secondary)]">
            Take a Quiz
          </span>
        </a>
      </div>
    </div>
  );
}
