"use client";

import { useState, useEffect, useCallback } from "react";
import { words } from "@/data/words";
import { Word } from "@/lib/types";
import {
  setWordProgress,
  updateStats,
  incrementQuizCount,
} from "@/lib/storage";

interface QuizQuestion {
  word: Word;
  options: string[];
  correctIndex: number;
  type: "definition" | "word";
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateQuestions(
  pool: Word[],
  count: number
): QuizQuestion[] {
  const selected = shuffle(pool).slice(0, count);

  return selected.map((word) => {
    const isDefType = Math.random() > 0.5;
    const others = shuffle(pool.filter((w) => w.id !== word.id)).slice(0, 3);

    if (isDefType) {
      // Given the word, pick the correct definition
      const options = shuffle([
        word.definition,
        ...others.map((o) => o.definition),
      ]);
      return {
        word,
        options,
        correctIndex: options.indexOf(word.definition),
        type: "definition",
      };
    } else {
      // Given the definition, pick the correct word
      const options = shuffle([
        word.word,
        ...others.map((o) => o.word),
      ]);
      return {
        word,
        options,
        correctIndex: options.indexOf(word.word),
        type: "word",
      };
    }
  });
}

export default function QuizPage() {
  const [filter, setFilter] = useState<"all" | "interview" | "research">("all");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);

  const startQuiz = useCallback(() => {
    const pool = words.filter(
      (w) => filter === "all" || w.category === filter || w.category === "both"
    );
    const q = generateQuestions(pool, questionCount);
    setQuestions(q);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setStarted(true);
  }, [filter, questionCount]);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);

    const q = questions[currentQ];
    const correct = index === q.correctIndex;
    if (correct) setScore((s) => s + 1);

    setWordProgress(q.word.id, correct);
    updateStats(correct);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ((c) => c + 1);
        setSelected(null);
      } else {
        incrementQuizCount();
        setFinished(true);
      }
    }, 1000);
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Quiz</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Test your vocabulary knowledge with multiple-choice questions.
        </p>

        <div className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-3">
              Category
            </label>
            <div className="flex gap-2">
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
          </div>

          {/* Question count */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-3">
              Number of Questions
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    questionCount === n
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full py-4 rounded-2xl text-lg font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80 transition-all shadow-lg shadow-[var(--accent-glow)]"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div
            className={`text-6xl font-bold mb-4 ${
              percentage >= 80
                ? "text-[var(--success)]"
                : percentage >= 50
                  ? "text-[var(--warning)]"
                  : "text-[var(--error)]"
            }`}
          >
            {percentage}%
          </div>
          <p className="text-xl text-[var(--text-secondary)] mb-2">
            {score} / {questions.length} correct
          </p>
          <p className="text-[var(--text-muted)] mb-8">
            {percentage >= 80
              ? "Excellent! You're building a strong vocabulary."
              : percentage >= 50
                ? "Good effort! Keep practicing to improve."
                : "Keep going! Daily practice makes all the difference."}
          </p>

          {/* Missed words */}
          {questions.filter((_, i) => {
            // We don't track per-question answers in state, so show all words
            return true;
          }).length > 0 && (
            <div className="text-left mb-8">
              <h3 className="text-lg font-semibold mb-3">Words from this quiz:</h3>
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
                  >
                    <span className="font-semibold text-[var(--accent-light)]">
                      {q.word.word}
                    </span>
                    <span className="text-sm text-[var(--text-muted)] line-clamp-1">
                      {q.word.definition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={startQuiz}
              className="flex-1 py-3 rounded-xl font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => setStarted(false)}
              className="flex-1 py-3 rounded-xl font-semibold bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-all"
            >
              New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-card)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{
              width: `${((currentQ + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm text-[var(--text-muted)]">
          {currentQ + 1}/{questions.length}
        </span>
        <span className="text-sm font-medium text-[var(--success)]">
          {score} correct
        </span>
      </div>

      {/* Question */}
      <div className="mb-8">
        <p className="text-sm text-[var(--text-muted)] mb-2 font-medium">
          {q.type === "definition"
            ? "What does this word mean?"
            : "Which word matches this definition?"}
        </p>
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
          <p className="text-xl font-semibold">
            {q.type === "definition" ? q.word.word : q.word.definition}
          </p>
          {q.type === "definition" && (
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {q.word.pronunciation} · {q.word.partOfSpeech}
            </p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((option, i) => {
          let style = "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--accent)]/40";

          if (selected !== null) {
            if (i === q.correctIndex) {
              style = "bg-green-500/10 border-green-500/50 text-green-400";
            } else if (i === selected && i !== q.correctIndex) {
              style = "bg-red-500/10 border-red-500/50 text-red-400";
            } else {
              style = "bg-[var(--bg-card)] border-[var(--border)] opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${style}`}
            >
              <span className="text-sm font-medium text-[var(--text-muted)] mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
