import { ExtractedImport, PackageEcosystem } from '../types';
import { NODE_BUILTINS, PYTHON_BUILTINS } from '../constants/builtins';

export class ImportParser {
  /**
   * Parse imports from a document given its text and language ID.
   */
  public static parse(text: string, languageId: string): ExtractedImport[] {
    const isPython = languageId === 'python';
    if (isPython) {
      return this.parsePython(text);
    }
    return this.parseJavaScriptTypeScript(text);
  }

  /**
   * Parse JavaScript and TypeScript imports/requires.
   */
  private static parseJavaScriptTypeScript(text: string): ExtractedImport[] {
    const results: ExtractedImport[] = [];
    const lines = text.split(/\r?\n/);

    // Regular expressions for JS/TS imports
    // 1. import ... from 'pkg' or import 'pkg'
    // 2. export ... from 'pkg'
    // 3. const x = require('pkg')
    // 4. import('pkg')
    const importRegex = /(?:import\s+(?:[\w*\s{},$]+\s+from\s+)?|export\s+(?:[\w*\s{},$]+\s+from\s+)?|require\s*\(\s*|import\s*\(\s*)['"]([^'"]+)['"]/g;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Skip single-line comments
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
        continue;
      }

      let match: RegExpExecArray | null;
      while ((match = importRegex.exec(line)) !== null) {
        const rawPath = match[1];
        if (!rawPath) {
          continue;
        }

        const isLocal = this.isLocalPath(rawPath);
        const baseName = this.extractBasePackage(rawPath, 'npm');
        const isBuiltin = this.isNodeBuiltin(rawPath, baseName);

        // Find character positions
        const matchIndex = match.index;
        const quoteChar = match[0].includes("'") ? "'" : '"';
        const startChar = line.indexOf(quoteChar, matchIndex) + 1;
        const endChar = startChar + rawPath.length;

        results.push({
          raw: rawPath,
          packageName: baseName,
          ecosystem: 'npm',
          line: lineIndex,
          startChar,
          endChar,
          isBuiltin,
          isLocal
        });
      }
    }

    return results;
  }

  /**
   * Parse Python imports.
   */
  private static parsePython(text: string): ExtractedImport[] {
    const results: ExtractedImport[] = [];
    const lines = text.split(/\r?\n/);

    // Python patterns:
    // 1. from package.sub import something
    // 2. import package, other_package
    // 3. import package as pkg
    const fromImportRegex = /^\s*from\s+([a-zA-Z0-9_\.]+)\s+import/g;
    const directImportRegex = /^\s*import\s+([a-zA-Z0-9_,\s]+)/g;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        continue;
      }

      // Check "from xyz import ..."
      let fromMatch: RegExpExecArray | null;
      while ((fromMatch = fromImportRegex.exec(line)) !== null) {
        const fullModule = fromMatch[1];
        if (fullModule.startsWith('.')) {
          // Relative import (.models, ..utils)
          continue;
        }

        const basePackage = fullModule.split('.')[0];
        const isBuiltin = PYTHON_BUILTINS.has(basePackage.toLowerCase());
        const startChar = line.indexOf(fullModule);
        const endChar = startChar + fullModule.length;

        results.push({
          raw: fullModule,
          packageName: basePackage,
          ecosystem: 'pypi',
          line: lineIndex,
          startChar,
          endChar,
          isBuiltin,
          isLocal: false
        });
      }

      // Check "import xyz, abc as foo"
      let directMatch: RegExpExecArray | null;
      while ((directMatch = directImportRegex.exec(line)) !== null) {
        const rawModules = directMatch[1].split(',');
        for (const rawMod of rawModules) {
          const clean = rawMod.trim().split(/\s+as\s+/)[0].trim();
          if (!clean || clean.startsWith('.')) {
            continue;
          }

          const basePackage = clean.split('.')[0];
          const isBuiltin = PYTHON_BUILTINS.has(basePackage.toLowerCase());
          const startChar = line.indexOf(clean);
          const endChar = startChar + clean.length;

          results.push({
            raw: clean,
            packageName: basePackage,
            ecosystem: 'pypi',
            line: lineIndex,
            startChar,
            endChar,
            isBuiltin,
            isLocal: false
          });
        }
      }
    }

    return results;
  }

  /**
   * Determine if an import path is local (e.g., ./foo, ../bar, /root, @/components).
   */
  public static isLocalPath(path: string): boolean {
    return (
      path.startsWith('.') ||
      path.startsWith('/') ||
      path.startsWith('~') ||
      path.startsWith('@/') || // Common alias for src/
      path.startsWith('#') // Node subpath imports
    );
  }

  /**
   * Extract base package name from an import path.
   * e.g., 'lodash/debounce' -> 'lodash'
   * e.g., '@tanstack/react-query/devtools' -> '@tanstack/react-query'
   */
  public static extractBasePackage(path: string, ecosystem: PackageEcosystem): string {
    if (ecosystem === 'npm') {
      let clean = path.replace(/^node:/, '');
      if (clean.startsWith('@')) {
        const parts = clean.split('/');
        if (parts.length >= 2) {
          return `${parts[0]}/${parts[1]}`;
        }
        return clean;
      }
      return clean.split('/')[0];
    }

    // Python
    return path.split('.')[0];
  }

  /**
   * Checks if a package is a Node.js standard built-in.
   */
  public static isNodeBuiltin(rawPath: string, baseName: string): boolean {
    if (rawPath.startsWith('node:')) {
      return true;
    }
    return NODE_BUILTINS.has(baseName.toLowerCase());
  }
}
