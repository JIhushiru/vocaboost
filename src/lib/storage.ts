"use client";

import { WordProgress, UserStats } from "./types";

const PROGRESS_KEY = "vocaboost_progress";
const STATS_KEY = "vocaboost_stats";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// Spaced repetition intervals in days
const SR_INTERVALS = [0, 1, 3, 7, 14, 30];

export function getProgress(): Record<string, WordProgress> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(PROGRESS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function setWordProgress(wordId: string, correct: boolean): void {
  const all = getProgress();
  const existing = all[wordId];
  const today = getToday();

  if (existing) {
    const newLevel = correct
      ? Math.min(existing.level + 1, 5)
      : Math.max(existing.level - 1, 0);
    const daysUntilNext = SR_INTERVALS[newLevel];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysUntilNext);

    all[wordId] = {
      ...existing,
      level: newLevel,
      lastReviewed: today,
      nextReview: nextDate.toISOString().split("T")[0],
      correctCount: existing.correctCount + (correct ? 1 : 0),
      incorrectCount: existing.incorrectCount + (correct ? 0 : 1),
    };
  } else {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (correct ? 1 : 0));
    all[wordId] = {
      wordId,
      level: correct ? 1 : 0,
      lastReviewed: today,
      nextReview: nextDate.toISOString().split("T")[0],
      correctCount: correct ? 1 : 0,
      incorrectCount: correct ? 0 : 1,
    };
  }

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

export function getStats(): UserStats {
  if (typeof window === "undefined") {
    return {
      streak: 0,
      lastActiveDate: "",
      totalWordsLearned: 0,
      totalQuizzesTaken: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
    };
  }
  const raw = localStorage.getItem(STATS_KEY);
  if (raw) return JSON.parse(raw);
  return {
    streak: 0,
    lastActiveDate: "",
    totalWordsLearned: 0,
    totalQuizzesTaken: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
  };
}

export function updateStats(correct: boolean): void {
  const stats = getStats();
  const today = getToday();

  if (stats.lastActiveDate === today) {
    // Already active today, just update counts
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (stats.lastActiveDate === yesterdayStr) {
      stats.streak += 1;
    } else {
      stats.streak = 1;
    }
    stats.lastActiveDate = today;
  }

  if (correct) {
    stats.totalCorrect += 1;
  } else {
    stats.totalIncorrect += 1;
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function incrementQuizCount(): void {
  const stats = getStats();
  stats.totalQuizzesTaken += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function incrementWordsLearned(): void {
  const stats = getStats();
  stats.totalWordsLearned += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getDailyWords(allWordIds: string[], count: number = 5): string[] {
  const today = getToday();
  // Use date as seed for consistent daily selection
  const seed = today.split("-").join("");
  const seedNum = parseInt(seed, 10);

  // Prioritize words due for review
  const progress = getProgress();
  const dueWords = allWordIds.filter((id) => {
    const p = progress[id];
    return p && p.nextReview <= today;
  });

  // Then new words (never seen)
  const newWords = allWordIds.filter((id) => !progress[id]);

  // Combine: due words first, then new words
  const prioritized = [...dueWords, ...newWords];

  if (prioritized.length <= count) {
    return prioritized.slice(0, count);
  }

  // Deterministic shuffle using seed
  const shuffled = [...prioritized];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seedNum + i * 31) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
