import { PackageMetadata } from '../types';

export class PypiClient {
  private static readonly PYPI_BASE = 'https://pypi.org/pypi';

  /**
   * Check if a package exists on PyPI and fetch metadata.
   */
  public static async checkPackage(pkgName: string): Promise<PackageMetadata> {
    const cleanName = pkgName.trim();
    const encodedName = encodeURIComponent(cleanName);

    try {
      const response = await fetch(`${this.PYPI_BASE}/${encodedName}/json`, {
        method: 'GET',
        headers: {
          'User-Agent': 'PhantomGuard-VSCode-Extension/1.0'
        },
        signal: AbortSignal.timeout(4000)
      });

      if (response.status === 404) {
        return {
          name: cleanName,
          ecosystem: 'pypi',
          exists: false,
          status: 'phantom',
          verifiedAt: Date.now()
        };
      }

      if (!response.ok) {
        return {
          name: cleanName,
          ecosystem: 'pypi',
          exists: true,
          status: 'verified',
          verifiedAt: Date.now()
        };
      }

      const data = (await response.json()) as any;
      const info = data.info || {};

      return {
        name: cleanName,
        ecosystem: 'pypi',
        exists: true,
        status: 'verified',
        version: info.version,
        description: info.summary,
        author: info.author,
        homepage: info.home_page || info.project_url,
        verifiedAt: Date.now()
      };
    } catch {
      return {
        name: cleanName,
        ecosystem: 'pypi',
        exists: true,
        status: 'verified',
        description: 'Verification bypassed (network timeout or offline)',
        verifiedAt: Date.now()
      };
    }
  }
}
