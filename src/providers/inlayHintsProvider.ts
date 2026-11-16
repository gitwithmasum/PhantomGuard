import * as vscode from 'vscode';
import { PackageCache } from '../cache/packageCache';
import { ImportParser } from '../parsers/importParser';

export class FuturisticInlayHintsProvider implements vscode.InlayHintsProvider {
  public provideInlayHints(
    document: vscode.TextDocument,
    range: vscode.Range,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.InlayHint[]> {
    const config = vscode.workspace.getConfiguration('phantomguard');
    const enabled = config.get<boolean>('enableInlayHints', true);
    if (!enabled) {
      return [];
    }

    const text = document.getText();
    const imports = ImportParser.parse(text, document.languageId, document.fileName);
    const hints: vscode.InlayHint[] = [];

    for (const imp of imports) {
      if (imp.isLocal || imp.isBuiltin) {
        continue;
      }

      if (imp.line < range.start.line || imp.line > range.end.line) {
        continue;
      }

      const meta = PackageCache.get(imp.ecosystem, imp.packageName);
      if (!meta) {
        continue;
      }

      const lineEndPos = document.lineAt(imp.line).range.end;

      if (!meta.exists || meta.status === 'phantom') {
        const hint = new vscode.InlayHint(
          lineEndPos,
          `  🚨 PHANTOM`,
          vscode.InlayHintKind.Type
        );
        hint.tooltip = new vscode.MarkdownString(
          `**PHANTOMGUARD ALERT:** \`${meta.name}\` does NOT exist on ${meta.ecosystem.toUpperCase()}!`
        );
        hint.paddingLeft = true;
        hints.push(hint);
      } else if (meta.status === 'verified') {
        const dl = meta.weeklyDownloads;
        let dlStr = '';
        if (dl !== undefined) {
          if (dl >= 1_000_000) {
            dlStr = ` • ${(dl / 1_000_000).toFixed(1)}M/wk`;
          } else if (dl >= 1_000) {
            dlStr = ` • ${(dl / 1_000).toFixed(0)}k/wk`;
          }
        }

        const hint = new vscode.InlayHint(
          lineEndPos,
          `  ✓ verified${dlStr}`,
          vscode.InlayHintKind.Parameter
        );
        hint.tooltip = new vscode.MarkdownString(
          `**PHANTOMGUARD:** Verified on ${meta.ecosystem.toUpperCase()} (v${meta.version || 'latest'})`
        );
        hint.paddingLeft = true;
        hints.push(hint);
      }
    }

    return hints;
  }
}
