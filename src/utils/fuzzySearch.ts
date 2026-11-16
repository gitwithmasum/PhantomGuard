/**
 * Levenshtein distance & fuzzy search utility to suggest real packages
 * when a user or AI makes a typo (e.g., 'lodsh' -> 'lodash').
 */

export class FuzzySearch {
  /**
   * Calculate Levenshtein distance between two strings.
   */
  public static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1 // deletion
            )
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Search official npm search API for the closest matching real package.
   */
  public static async findNpmSuggestion(typoName: string): Promise<string | undefined> {
    try {
      const clean = typoName.replace(/[@\/]/g, ' ').trim();
      const res = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(clean)}&size=3`,
        {
          headers: { 'User-Agent': 'PhantomGuard-VSCode-Extension/1.0' },
          signal: AbortSignal.timeout(2500)
        }
      );

      if (!res.ok) {
        return undefined;
      }

      const data = (await res.json()) as any;
      if (data.objects && data.objects.length > 0) {
        const topCandidate = data.objects[0].package.name;
        const distance = this.levenshtein(
          typoName.toLowerCase(),
          topCandidate.toLowerCase()
        );

        // If distance is reasonable compared to length, suggest it
        if (distance <= Math.max(3, Math.floor(typoName.length * 0.4))) {
          return topCandidate;
        }
      }
    } catch {
      // Ignore network timeout
    }
    return undefined;
  }
}
