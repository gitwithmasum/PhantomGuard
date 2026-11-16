import * as vscode from 'vscode';
import { PackageCache } from '../cache/packageCache';
import { ImportParser } from '../parsers/importParser';

export class FuturisticHoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const text = document.getText();
    const imports = ImportParser.parse(text, document.languageId);

    // Find if current position is within an import
    const matchedImport = imports.find(
      (imp) =>
        imp.line === position.line &&
        position.character >= imp.startChar &&
        position.character <= imp.endChar
    );

    if (!matchedImport || matchedImport.isLocal || matchedImport.isBuiltin) {
      return null;
    }

    const meta = PackageCache.get(matchedImport.ecosystem, matchedImport.packageName);
    if (!meta) {
      return null;
    }

    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportHtml = true;

    if (!meta.exists || meta.status === 'phantom') {
      md.appendMarkdown(`### 🛡️ **PHANTOMGUARD** // \`CYBER-SENTINEL\`\n`);
      md.appendMarkdown(`---\n`);
      md.appendMarkdown(`**STATUS:** <span style="color:#ff0055;">**🚨 CRITICAL: PHANTOM PACKAGE DETECTED**</span>\n\n`);
      md.appendMarkdown(`| Metric | Telemetry |\n`);
      md.appendMarkdown(`| :--- | :--- |\n`);
      md.appendMarkdown(`| **Target Package** | \`${meta.name}\` |\n`);
      md.appendMarkdown(`| **Ecosystem** | \`${meta.ecosystem.toUpperCase()}\` |\n`);
      md.appendMarkdown(`| **Registry Check** | ❌ \`NOT FOUND\` |\n`);
      md.appendMarkdown(`| **Threat Vector** | **AI Hallucination / Supply-Chain Hijack** |\n\n`);
      md.appendMarkdown(`> ⚠️ **SECURITY WARNING:**\n`);
      md.appendMarkdown(`> This package does not exist on the official registry. AI code models (ChatGPT, Copilot, Cursor) frequently invent non-existent packages. Running \`npm install\` or \`pip install\` with phantom packages invites typosquatting and malicious payload attacks.\n\n`);
      
      const searchUrl =
        meta.ecosystem === 'npm'
          ? `https://www.npmjs.com/search?q=${encodeURIComponent(meta.name)}`
          : `https://pypi.org/search/?q=${encodeURIComponent(meta.name)}`;

      md.appendMarkdown(`[🔍 Search Registry](${searchUrl}) • [🛡️ Add to Whitelist](command:phantomguard.whitelistPackage?${encodeURIComponent(JSON.stringify([meta.name]))})\n`);
    } else {
      const dlText = meta.weeklyDownloads
        ? `${meta.weeklyDownloads.toLocaleString()} / wk`
        : 'N/A';
      const versionText = meta.version ? `\`v${meta.version}\`` : 'N/A';

      md.appendMarkdown(`### 🛡️ **PHANTOMGUARD** // \`AUTHENTICATED\`\n`);
      md.appendMarkdown(`---\n`);
      md.appendMarkdown(`**STATUS:** <span style="color:#00ff66;">**✅ ACTIVE & SECURE**</span>\n\n`);
      md.appendMarkdown(`| Metric | Telemetry |\n`);
      md.appendMarkdown(`| :--- | :--- |\n`);
      md.appendMarkdown(`| **Package** | \`${meta.name}\` |\n`);
      md.appendMarkdown(`| **Latest Version** | ${versionText} |\n`);
      md.appendMarkdown(`| **Downloads** | \`${dlText}\` |\n`);
      md.appendMarkdown(`| **Description** | *${(meta.description || 'Verified package').slice(0, 80)}* |\n\n`);
      
      if (meta.isDeprecated) {
        md.appendMarkdown(`> ⚠️ **NOTE:** This package is flagged as **DEPRECATED** on the official registry.\n\n`);
      }
    }

    const range = new vscode.Range(
      new vscode.Position(matchedImport.line, matchedImport.startChar),
      new vscode.Position(matchedImport.line, matchedImport.endChar)
    );

    return new vscode.Hover(md, range);
  }
}
