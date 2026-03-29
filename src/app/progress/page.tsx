"use client";

import { useState, useEffect } from "react";
import { words } from "@/data/words";
import { getProgress, getStats } from "@/lib/storage";
import { WordProgress, UserStats } from "@/lib/types";

export default function ProgressPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progress, setProgress] = useState<Record<string, WordProgress>>({});

  useEffect(() => {
    setStats(getStats());
    setProgress(getProgress());
  }, []);

  if (!stats) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  const totalWords = words.length;
  const reviewedWords = Object.keys(progress).length;
  const masteredWords = Object.values(progress).filter(
    (p) => p.level >= 4
  ).length;
  const learningWords = Object.values(progress).filter(
    (p) => p.level > 0 && p.level < 4
  ).length;
  const newWords = totalWords - reviewedWords;

  const accuracy =
    stats.totalCorrect + stats.totalIncorrect > 0
      ? Math.round(
          (stats.totalCorrect / (stats.totalCorrect + stats.totalIncorrect)) *
            100
        )
      : 0;

  // Category breakdown
  const interviewWords = words.filter(
    (w) => w.category === "interview" || w.category === "both"
  );
  const researchWords = words.filter(
    (w) => w.category === "research" || w.category === "both"
  );
  const interviewMastered = interviewWords.filter(
    (w) => progress[w.id]?.level >= 4
  ).length;
  const researchMastered = researchWords.filter(
    (w) => progress[w.id]?.level >= 4
  ).length;

  // Difficulty breakdown
  const byDifficulty = {
    beginner: words.filter((w) => w.difficulty === "beginner"),
    intermediate: words.filter((w) => w.difficulty === "intermediate"),
    advanced: words.filter((w) => w.difficulty === "advanced"),
  };

  // Words by mastery level
  const wordsByLevel = [0, 1, 2, 3, 4, 5].map((level) => ({
    level,
    count:
      level === 0
        ? newWords + Object.values(progress).filter((p) => p.level === 0).length
        : Object.values(progress).filter((p) => p.level === level).length,
    label: ["New", "Seen", "Familiar", "Learning", "Learned", "Mastered"][level],
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Progress</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Track your vocabulary growth over time.
      </p>

      {/* Streak and Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Streak"
          value={`${stats.streak}`}
          suffix="days"
          color="text-orange-400"
        />
        <StatCard
          label="Accuracy"
          value={`${accuracy}`}
          suffix="%"
          color="text-green-400"
        />
        <StatCard
          label="Reviewed"
          value={`${reviewedWords}`}
          suffix={`/ ${totalWords}`}
          color="text-blue-400"
        />
        <StatCard
          label="Quizzes"
          value={`${stats.totalQuizzesTaken}`}
          suffix="taken"
          color="text-purple-400"
        />
      </div>

      {/* Mastery Overview */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Mastery Overview</h2>
        <div className="space-y-3">
          <ProgressBar
            label="Mastered"
            count={masteredWords}
            total={totalWords}
            color="bg-green-500"
          />
          <ProgressBar
            label="Learning"
            count={learningWords}
            total={totalWords}
            color="bg-yellow-500"
          />
          <ProgressBar
            label="New"
            count={newWords}
            total={totalWords}
            color="bg-[var(--border)]"
          />
        </div>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-1">
            Interview Words
          </h3>
          <p className="text-2xl font-bold text-blue-400">
            {interviewMastered}
            <span className="text-sm font-normal text-[var(--text-muted)]">
              {" "}
              / {interviewWords.length} mastered
            </span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-secondary)]">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{
                width: `${(interviewMastered / interviewWords.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h3 className="text-sm font-medium text-[var(--text-muted)] mb-1">
            Research Words
          </h3>
          <p className="text-2xl font-bold text-emerald-400">
            {researchMastered}
            <span className="text-sm font-normal text-[var(--text-muted)]">
              {" "}
              / {researchWords.length} mastered
            </span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-secondary)]">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${(researchMastered / researchWords.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">By Difficulty</h2>
        <div className="space-y-3">
          {(["beginner", "intermediate", "advanced"] as const).map((diff) => {
            const ws = byDifficulty[diff];
            const mastered = ws.filter(
              (w) => progress[w.id]?.level >= 4
            ).length;
            const colors = {
              beginner: "bg-green-500",
              intermediate: "bg-yellow-500",
              advanced: "bg-red-500",
            };
            return (
              <ProgressBar
                key={diff}
                label={diff.charAt(0).toUpperCase() + diff.slice(1)}
                count={mastered}
                total={ws.length}
                color={colors[diff]}
              />
            );
          })}
        </div>
      </div>

      {/* Word Level Distribution */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h2 className="text-lg font-semibold mb-4">Word Levels</h2>
        <div className="flex items-end gap-2 h-32">
          {wordsByLevel.map((item) => {
            const maxCount = Math.max(...wordsByLevel.map((w) => w.count), 1);
            const height = (item.count / maxCount) * 100;
            return (
              <div
                key={item.level}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-[var(--text-muted)]">
                  {item.count}
                </span>
                <div
                  className="w-full rounded-t-lg bg-[var(--accent)] transition-all"
                  style={{
                    height: `${Math.max(height, 4)}%`,
                    opacity: 0.4 + item.level * 0.12,
                  }}
                />
                <span className="text-[10px] text-[var(--text-muted)] text-center leading-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: string;
  suffix: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{suffix}</p>
    </div>
  );
}

function ProgressBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-muted)]">
          {count} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--bg-secondary)]">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
