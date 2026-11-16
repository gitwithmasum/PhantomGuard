import * as vscode from 'vscode';
import { PackageCache } from '../cache/packageCache';

export class FuturisticCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const phantomDiagnostics = context.diagnostics.filter(
      (d) => d.source === 'PhantomGuard' && d.code && typeof d.code === 'object' && 'value' in d.code
    );

    if (phantomDiagnostics.length === 0) {
      return [];
    }

    const actions: vscode.CodeAction[] = [];

    for (const diag of phantomDiagnostics) {
      const lineText = document.lineAt(diag.range.start.line).text;
      const targetPackage = document.getText(diag.range).replace(/['"]/g, '').trim();

      // Check if we have a fuzzy suggestion from cache
      const cachedNpm = PackageCache.get('npm', targetPackage);
      const cachedPypi = PackageCache.get('pypi', targetPackage);
      const suggestion = cachedNpm?.suggestedAlternative || cachedPypi?.suggestedAlternative;

      if (suggestion) {
        const replaceAction = new vscode.CodeAction(
          `💡 [PhantomGuard] Replace with "${suggestion}" (Did you mean?)`,
          vscode.CodeActionKind.QuickFix
        );
        replaceAction.isPreferred = true;
        replaceAction.diagnostics = [diag];
        const replaceEdit = new vscode.WorkspaceEdit();
        replaceEdit.replace(document.uri, diag.range, suggestion);
        replaceAction.edit = replaceEdit;
        actions.push(replaceAction);
      }

      // Action 1: Remove the phantom import line
      const removeAction = new vscode.CodeAction(
        `🛡️ [PhantomGuard] Neutralize: Remove hallucinated import`,
        vscode.CodeActionKind.QuickFix
      );
      if (!suggestion) {
        removeAction.isPreferred = true;
      }
      removeAction.diagnostics = [diag];
      const edit = new vscode.WorkspaceEdit();
      edit.delete(document.uri, document.lineAt(diag.range.start.line).rangeIncludingLineBreak);
      removeAction.edit = edit;
      actions.push(removeAction);

      // Action 2: Add comment explaining hallucination
      const commentAction = new vscode.CodeAction(
        `⚠️ [PhantomGuard] Annotate as suspected AI hallucination`,
        vscode.CodeActionKind.QuickFix
      );
      const commentEdit = new vscode.WorkspaceEdit();
      commentEdit.insert(
        document.uri,
        new vscode.Position(diag.range.start.line, 0),
        `// [PHANTOMGUARD ALERT]: AI Hallucination detected for "${targetPackage}"\n`
      );
      commentAction.edit = commentEdit;
      actions.push(commentAction);

      // Action 3: Whitelist package (trust internal)
      const whitelistAction = new vscode.CodeAction(
        `⚡ [PhantomGuard] Whitelist "${targetPackage}" (Trust internal package)`,
        vscode.CodeActionKind.QuickFix
      );
      whitelistAction.command = {
        command: 'phantomguard.whitelistPackage',
        title: 'Whitelist Package',
        arguments: [targetPackage]
      };
      actions.push(whitelistAction);
    }

    return actions;
  }
}
