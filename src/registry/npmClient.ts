import { PackageMetadata } from '../types';
import { FuzzySearch } from '../utils/fuzzySearch';

export class NpmClient {
  private static readonly REGISTRY_BASE = 'https://registry.npmjs.org';
  private static readonly DOWNLOADS_BASE = 'https://api.npmjs.org/downloads/point/last-week';

  /**
   * Check if a package exists on npm and fetch metadata.
   */
  public static async checkPackage(pkgName: string): Promise<PackageMetadata> {
    const cleanName = pkgName.trim();
    const encodedName = cleanName.startsWith('@')
      ? `@${encodeURIComponent(cleanName.slice(1))}`
      : encodeURIComponent(cleanName);

    try {
      // 1. Check registry with lightweight header request
      const response = await fetch(`${this.REGISTRY_BASE}/${encodedName}`, {
        method: 'GET',
        headers: {
          // Request abbreviated metadata to save bandwidth and increase speed
          Accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8',
          'User-Agent': 'PhantomGuard-VSCode-Extension/1.0'
        },
        signal: AbortSignal.timeout(4000)
      });

      if (response.status === 404) {
        // Search for fuzzy suggestion
        const suggestedAlternative = await FuzzySearch.findNpmSuggestion(cleanName);

        return {
          name: cleanName,
          ecosystem: 'npm',
          exists: false,
          status: 'phantom',
          suggestedAlternative,
          verifiedAt: Date.now()
        };
      }

      if (!response.ok) {
        // Any 5xx or server error: don't flag as phantom, treat as checking error
        return {
          name: cleanName,
          ecosystem: 'npm',
          exists: true, // assume exists on server error to avoid false positives
          status: 'verified',
          verifiedAt: Date.now()
        };
      }

      const data = (await response.json()) as any;
      const latestVersion = data['dist-tags']?.latest || Object.keys(data.versions || {}).pop();
      const versionData = data.versions?.[latestVersion] || {};
      const isDeprecated = !!(versionData.deprecated || data.deprecated);

      // 2. Fetch weekly downloads in parallel (optional enhancement)
      let weeklyDownloads: number | undefined;
      try {
        const dlRes = await fetch(`${this.DOWNLOADS_BASE}/${encodedName}`, {
          signal: AbortSignal.timeout(2500)
        });
        if (dlRes.ok) {
          const dlData = (await dlRes.json()) as any;
          weeklyDownloads = dlData.downloads;
        }
      } catch {
        // Ignore download fetch failures gracefully
      }

      return {
        name: cleanName,
        ecosystem: 'npm',
        exists: true,
        status: 'verified',
        version: latestVersion,
        description: data.description || versionData.description,
        weeklyDownloads,
        isDeprecated,
        verifiedAt: Date.now()
      };
    } catch (err: any) {
      // Network timeout or offline - fail safe: do not falsely accuse as phantom
      return {
        name: cleanName,
        ecosystem: 'npm',
        exists: true,
        status: 'verified',
        description: 'Verification bypassed (network timeout or offline)',
        verifiedAt: Date.now()
      };
    }
  }
}
