export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  category: "interview" | "research" | "both";
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface WordProgress {
  wordId: string;
  level: number; // 0-5 (spaced repetition level)
  lastReviewed: string; // ISO date
  nextReview: string; // ISO date
  correctCount: number;
  incorrectCount: number;
}

export interface UserStats {
  streak: number;
  lastActiveDate: string;
  totalWordsLearned: number;
  totalQuizzesTaken: number;
  totalCorrect: number;
  totalIncorrect: number;
}
