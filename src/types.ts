export type PackageEcosystem = 'npm' | 'pypi';

export type PackageStatus = 'verified' | 'phantom' | 'suspicious' | 'checking' | 'whitelisted' | 'builtin' | 'local';

export interface PackageMetadata {
  name: string;
  ecosystem: PackageEcosystem;
  exists: boolean;
  status: PackageStatus;
  version?: string;
  description?: string;
  weeklyDownloads?: number;
  lastUpdated?: string;
  isDeprecated?: boolean;
  author?: string;
  homepage?: string;
  verifiedAt: number;
}

export interface ExtractedImport {
  raw: string;
  packageName: string;
  ecosystem: PackageEcosystem;
  line: number;
  startChar: number;
  endChar: number;
  isBuiltin: boolean;
  isLocal: boolean;
}

export interface ScanResult {
  fileUri: string;
  fileName: string;
  scannedAt: number;
  imports: ExtractedImport[];
  phantomCount: number;
  suspiciousCount: number;
  verifiedCount: number;
}
