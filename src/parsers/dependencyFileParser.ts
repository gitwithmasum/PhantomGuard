import { ExtractedImport } from '../types';

export class DependencyFileParser {
  /**
   * Parse package.json dependencies and return them as ExtractedImport items.
   */
  public static parsePackageJson(text: string): ExtractedImport[] {
    const results: ExtractedImport[] = [];
    const lines = text.split(/\r?\n/);

    const depSections = [
      '"dependencies"',
      '"devDependencies"',
      '"peerDependencies"',
      '"optionalDependencies"'
    ];

    let insideSection = false;
    let sectionIndent = 0;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Check if entering a dependency section
      if (depSections.some((sec) => line.includes(sec))) {
        insideSection = true;
        sectionIndent = line.search(/\S/);
        continue;
      }

      if (insideSection) {
        // If line is closing brace with same or lower indentation, exit section
        const currentIndent = line.search(/\S/);
        if (line.trim().startsWith('}') && (currentIndent <= sectionIndent || currentIndent === -1)) {
          insideSection = false;
          continue;
        }

        // Match "package-name": "version"
        const match = /^\s*"(@?[a-zA-Z0-9_\-\.\/]+)"\s*:\s*"[^"]*"/g.exec(line);
        if (match) {
          const rawPkg = match[1];
          const quoteIndex = line.indexOf(`"${rawPkg}"`);
          const startChar = quoteIndex + 1;
          const endChar = startChar + rawPkg.length;

          results.push({
            raw: rawPkg,
            packageName: rawPkg,
            ecosystem: 'npm',
            line: lineIndex,
            startChar,
            endChar,
            isBuiltin: false,
            isLocal: false
          });
        }
      }
    }

    return results;
  }

  /**
   * Parse Python requirements.txt dependencies.
   */
  public static parseRequirementsTxt(text: string): ExtractedImport[] {
    const results: ExtractedImport[] = [];
    const lines = text.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex].trim();

      // Skip comments, empty lines, and flags (-r, -i, etc.)
      if (!line || line.startsWith('#') || line.startsWith('-')) {
        continue;
      }

      // Match package name before any ==, >=, <=, ~=, !=, or ;
      const match = /^([a-zA-Z0-9_\-\.]+)/.exec(line);
      if (match) {
        const pkgName = match[1];
        const rawLine = lines[lineIndex];
        const startChar = rawLine.indexOf(pkgName);
        const endChar = startChar + pkgName.length;

        results.push({
          raw: pkgName,
          packageName: pkgName,
          ecosystem: 'pypi',
          line: lineIndex,
          startChar,
          endChar,
          isBuiltin: false,
          isLocal: false
        });
      }
    }

    return results;
  }
}
