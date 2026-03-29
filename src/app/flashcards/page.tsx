"use client";

import { useState, useEffect, useCallback } from "react";
import { words } from "@/data/words";
import { Word } from "@/lib/types";
import {
  getProgress,
  setWordProgress,
  updateStats,
  incrementWordsLearned,
} from "@/lib/storage";

export default function FlashcardsPage() {
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState<"all" | "interview" | "research">("all");
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);

  const buildDeck = useCallback(
    (f: "all" | "interview" | "research") => {
      const progress = getProgress();
      const today = new Date().toISOString().split("T")[0];

      let filtered = words.filter(
        (w) => f === "all" || w.category === f || w.category === "both"
      );

      // Prioritize: due for review > new > already learned
      filtered.sort((a, b) => {
        const pa = progress[a.id];
        const pb = progress[b.id];

        if (!pa && !pb) return 0;
        if (!pa) return -1;
        if (!pb) return 1;

        // Due words first
        const aDue = pa.nextReview <= today;
        const bDue = pb.nextReview <= today;
        if (aDue && !bDue) return -1;
        if (!aDue && bDue) return 1;

        return pa.level - pb.level;
      });

      setDeck(filtered);
      setCurrentIndex(0);
      setFlipped(false);
    },
    []
  );

  useEffect(() => {
    buildDeck(filter);
  }, [filter, buildDeck]);

  const currentWord = deck[currentIndex];

  const handleResponse = (correct: boolean) => {
    if (!currentWord) return;

    setWordProgress(currentWord.id, correct);
    updateStats(correct);
    if (correct) incrementWordsLearned();

    setShowResult(correct ? "correct" : "incorrect");

    setTimeout(() => {
      setShowResult(null);
      setFlipped(false);
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
        buildDeck(filter);
      }
    }, 600);
  };

  const progress = typeof window !== "undefined" ? getProgress() : {};
  const currentWordProgress = currentWord ? progress[currentWord.id] : null;

  if (!currentWord) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-[var(--text-muted)]">Loading flashcards...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
        <p className="text-[var(--text-secondary)]">
          Tap the card to reveal, then rate your recall.
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

      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-card)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-[var(--text-muted)]">
          {currentIndex + 1} / {deck.length}
        </span>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={`relative min-h-[320px] rounded-2xl border-2 p-8 transition-all duration-300 cursor-pointer ${
          showResult === "correct"
            ? "border-[var(--success)] bg-[var(--success)]/5 shadow-lg shadow-green-500/10"
            : showResult === "incorrect"
              ? "border-[var(--error)] bg-[var(--error)]/5 shadow-lg shadow-red-500/10"
              : flipped
                ? "border-[var(--accent)] bg-[var(--bg-card)] shadow-lg shadow-[var(--accent-glow)]"
                : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40"
        }`}
      >
        {!flipped ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[280px]">
            <p className="text-4xl font-bold mb-4">{currentWord.word}</p>
            <p className="text-[var(--text-muted)]">
              {currentWord.pronunciation} · {currentWord.partOfSpeech}
            </p>
            {currentWordProgress && (
              <div className="mt-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < currentWordProgress.level
                        ? "bg-[var(--accent)]"
                        : "bg-[var(--border)]"
                    }`}
                  />
                ))}
              </div>
            )}
            <p className="text-sm text-[var(--text-muted)] mt-6">
              Tap to reveal
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold">{currentWord.word}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {currentWord.pronunciation} · {currentWord.partOfSpeech}
              </p>
            </div>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              {currentWord.definition}
            </p>
            <div className="rounded-xl bg-[var(--bg-secondary)] p-4 border-l-2 border-[var(--accent)]">
              <p className="text-sm text-[var(--text-muted)] mb-1 font-medium">
                Example
              </p>
              <p className="text-[var(--text-secondary)] italic">
                &ldquo;{currentWord.example}&rdquo;
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentWord.synonyms.map((syn) => (
                <span
                  key={syn}
                  className="px-3 py-1 rounded-full text-sm bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                >
                  {syn}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Response buttons */}
      {flipped && !showResult && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => handleResponse(false)}
            className="flex-1 py-4 rounded-xl text-lg font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all"
          >
            Didn&apos;t know
          </button>
          <button
            onClick={() => handleResponse(true)}
            className="flex-1 py-4 rounded-xl text-lg font-semibold bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all"
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  );
}
