import { FOUND_ITEMS } from "@/constants/mockData";
import type { FoundItem } from "@/constants/types";

export interface MatchResult {
  item: FoundItem;
  score: number; // 0–100
  reasons: string[];
}

/**
 * Compute a similarity score between a lost-item description and all found
 * items. Returns results sorted by score descending, only those >= 20.
 */
export function findMatches(opts: {
  category: string;
  title: string;
  description: string;
  location: string;
}): MatchResult[] {
  const results: MatchResult[] = [];

  for (const found of FOUND_ITEMS) {
    let score = 0;
    const reasons: string[] = [];

    // Category match — worth 40 pts
    if (
      found.category.toLowerCase() === opts.category.toLowerCase()
    ) {
      score += 40;
      reasons.push("Same category");
    } else if (
      opts.category &&
      found.category.toLowerCase().includes(opts.category.toLowerCase().slice(0, 4))
    ) {
      score += 15;
      reasons.push("Similar category");
    }

    // Keyword overlap between titles — worth up to 30 pts
    const titleWords = tokenize(opts.title);
    const foundTitleWords = tokenize(found.title);
    const titleOverlap = overlap(titleWords, foundTitleWords);
    if (titleOverlap > 0) {
      const pts = Math.min(30, titleOverlap * 15);
      score += pts;
      reasons.push(`${titleOverlap} keyword${titleOverlap > 1 ? "s" : ""} match in title`);
    }

    // Description keyword overlap — worth up to 20 pts
    const descWords = tokenize(opts.description);
    const foundDescWords = tokenize(found.description);
    const descOverlap = overlap(descWords, foundDescWords);
    if (descOverlap > 0) {
      const pts = Math.min(20, descOverlap * 5);
      score += pts;
      reasons.push("Description keywords match");
    }

    // Location proximity — worth 10 pts (basic area name matching)
    const lostArea = extractArea(opts.location);
    const foundArea = extractArea(found.foundLocation);
    if (lostArea && foundArea && lostArea === foundArea) {
      score += 10;
      reasons.push("Same area");
    } else if (
      lostArea &&
      foundArea &&
      (found.foundLocation.toLowerCase().includes(lostArea) ||
        opts.location.toLowerCase().includes(foundArea))
    ) {
      score += 5;
      reasons.push("Nearby location");
    }

    if (score >= 20) {
      results.push({ item: found, score: Math.min(score, 100), reasons });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

function overlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((w) => setB.has(w)).length;
}

function extractArea(location: string): string {
  // Return first 2-word token before comma as the area identifier
  const parts = location.split(",");
  if (parts.length === 0) return "";
  return parts[0].trim().toLowerCase().split(/\s+/).slice(0, 2).join(" ");
}

const STOP_WORDS = new Set([
  "with", "that", "this", "from", "have", "been", "also", "some",
  "near", "was", "and", "the", "for", "not", "are", "but",
]);
