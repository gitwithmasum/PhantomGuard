import * as vscode from 'vscode';
import { ExtractedImport, PackageMetadata } from '../types';
import { ImportParser } from '../parsers/importParser';
import { NpmClient } from '../registry/npmClient';
import { PypiClient } from '../registry/pypiClient';
import { PackageCache } from '../cache/packageCache';

export interface VerifiedImport {
  extracted: ExtractedImport;
  metadata: PackageMetadata;
}

export class ScanManager {
  /**
   * Scan a document and return all imports with their verification status.
   */
  public static async scanDocument(document: vscode.TextDocument): Promise<VerifiedImport[]> {
    const supportedLanguages = [
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
      'python'
    ];

    if (!supportedLanguages.includes(document.languageId)) {
      return [];
    }

    const config = vscode.workspace.getConfiguration('phantomguard');
    const enableNpm = config.get<boolean>('enableNpm', true);
    const enablePypi = config.get<boolean>('enablePypi', true);
    const strictMode = config.get<boolean>('strictMode', false);

    const text = document.getText();
    const imports = ImportParser.parse(text, document.languageId);
    const verifiedResults: VerifiedImport[] = [];

    // Filter candidate packages to check
    const candidates = imports.filter((imp) => {
      if (imp.isLocal || imp.isBuiltin) {
        return false;
      }
      if (PackageCache.isWhitelisted(imp.packageName)) {
        return false;
      }
      if (imp.ecosystem === 'npm' && !enableNpm) {
        return false;
      }
      if (imp.ecosystem === 'pypi' && !enablePypi) {
        return false;
      }
      return true;
    });

    // Check each candidate against cache or registry
    const promises = candidates.map(async (imp) => {
      let meta = PackageCache.get(imp.ecosystem, imp.packageName);
      if (!meta) {
        if (imp.ecosystem === 'npm') {
          meta = await NpmClient.checkPackage(imp.packageName);
        } else {
          meta = await PypiClient.checkPackage(imp.packageName);
        }
        PackageCache.set(meta);
      }

      // Check strictMode for low-download suspicious packages
      if (meta.exists && strictMode && meta.weeklyDownloads !== undefined && meta.weeklyDownloads < 1000) {
        meta = {
          ...meta,
          status: 'suspicious'
        };
      }

      verifiedResults.push({
        extracted: imp,
        metadata: meta
      });
    });

    await Promise.all(promises);
    return verifiedResults;
  }
}
