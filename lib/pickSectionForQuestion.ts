type SectionForDetection = { id: string; name: string; source_ids: string[] };

/**
 * Picks the best-matching section for a question using the section name.
 * No LLM call: word overlap + full-name match. Fallback to fallbackSectionId when no match.
 */
export function pickSectionForQuestion(
  question: string,
  userSections: SectionForDetection[],
  fallbackSectionId: string | null
): string | null {
  if (!question?.trim() || userSections.length === 0)
    return fallbackSectionId;

  const q = question.trim().toLowerCase();
  const qWords = new Set(q.split(/\s+/).filter(Boolean));

  let bestId: string | null = null;
  let bestScore = 0;

  for (const section of userSections) {
    const name = section.name.trim().toLowerCase();
    if (!name) continue;

    const nameWords = name.split(/\s+/).filter(Boolean);
    const fullMatch = q.includes(name);
    const wordMatches = nameWords.filter((w) => qWords.has(w) || q.includes(w)).length;

    const score = fullMatch ? 10 + wordMatches : wordMatches;
    if (score > bestScore) {
      bestScore = score;
      bestId = section.id;
    }
  }

  return bestId ?? fallbackSectionId;
}
