import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const GENERATED_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "generated-words.json"
);

interface GeneratedWord {
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

async function loadExisting(): Promise<GeneratedWord[]> {
  try {
    const data = await readFile(GENERATED_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const { category, topic, count } = await request.json();

  const wordCount = Math.min(count || 10, 20);
  const cat = category || "both";
  const topicHint = topic ? ` related to "${topic}"` : "";

  const prompt = `Generate exactly ${wordCount} vocabulary words for someone improving their ${cat === "both" ? "interview and research paper" : cat} vocabulary${topicHint}.

Return ONLY a valid JSON array with no other text. Each object must have exactly these fields:
- "word": the vocabulary word (string)
- "pronunciation": IPA pronunciation (string, e.g. "/ˈwɜːrd/")
- "partOfSpeech": part of speech (string, e.g. "noun", "verb", "adjective")
- "definition": clear definition (string)
- "example": a practical example sentence using the word in a ${cat === "research" ? "research paper" : cat === "interview" ? "job interview" : "professional"} context (string)
- "synonyms": array of 2-3 synonyms (string[])
- "category": "${cat}" (string)
- "difficulty": one of "beginner", "intermediate", or "advanced" (string)

Only output the JSON array, nothing else.`;

  try {
    const result = await new Promise<string>((resolve, reject) => {
      execFile(
        "claude",
        ["-p", prompt, "--output-format", "text"],
        { timeout: 60000, maxBuffer: 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`Claude CLI error: ${error.message}\n${stderr}`));
            return;
          }
          resolve(stdout);
        }
      );
    });

    // Extract JSON from response — handle possible markdown code blocks
    let jsonStr = result.trim();
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse Claude response as JSON" },
        { status: 500 }
      );
    }
    jsonStr = jsonMatch[0];

    const newWords: GeneratedWord[] = JSON.parse(jsonStr);

    // Validate structure
    for (const w of newWords) {
      if (!w.word || !w.definition || !w.example) {
        return NextResponse.json(
          { error: "Invalid word structure in response" },
          { status: 500 }
        );
      }
    }

    // Load existing, assign IDs, deduplicate, save
    const existing = await loadExisting();
    const existingWordSet = new Set(existing.map((w) => w.word.toLowerCase()));

    const withIds = newWords
      .filter((w) => !existingWordSet.has(w.word.toLowerCase()))
      .map((w, i) => ({
        ...w,
        id: `gen-${Date.now()}-${i}`,
        category: (["interview", "research", "both"].includes(w.category)
          ? w.category
          : cat) as "interview" | "research" | "both",
        difficulty: (["beginner", "intermediate", "advanced"].includes(
          w.difficulty
        )
          ? w.difficulty
          : "intermediate") as "beginner" | "intermediate" | "advanced",
      }));

    const merged = [...existing, ...withIds];
    await writeFile(GENERATED_PATH, JSON.stringify(merged, null, 2));

    return NextResponse.json({
      added: withIds.length,
      total: merged.length,
      words: withIds,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const words = await loadExisting();
  return NextResponse.json({ words, total: words.length });
}
