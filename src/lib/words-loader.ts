"use client";

import { words as staticWords } from "@/data/words";
import { Word } from "./types";

export async function getAllWords(): Promise<Word[]> {
  try {
    const res = await fetch("/api/generate");
    const data = await res.json();
    const generated: Word[] = data.words || [];
    return [...staticWords, ...generated];
  } catch {
    return staticWords;
  }
}

export function getStaticWords(): Word[] {
  return staticWords;
}
