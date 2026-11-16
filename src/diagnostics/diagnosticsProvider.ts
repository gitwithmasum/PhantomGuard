import * as vscode from 'vscode';
import { VerifiedImport } from '../scanners/scanManager';

export class DiagnosticsProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('phantomguard');
  }

  public updateDiagnostics(document: vscode.TextDocument, results: VerifiedImport[]): void {
    const diagnostics: vscode.Diagnostic[] = [];

    for (const item of results) {
      const { extracted, metadata } = item;

      if (!metadata.exists || metadata.status === 'phantom') {
        const range = new vscode.Range(
          new vscode.Position(extracted.line, extracted.startChar),
          new vscode.Position(extracted.line, extracted.endChar)
        );

        const registryName = extracted.ecosystem === 'npm' ? 'registry.npmjs.org' : 'pypi.org';
        const message = `[PHANTOMGUARD // THREAT DETECTED] Package "${extracted.packageName}" was NOT found on ${registryName}. High probability of AI hallucination or phantom supply-chain vector!`;

        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
        diagnostic.source = 'PhantomGuard';
        diagnostic.code = {
          value: 'phantom-package-hallucination',
          target: vscode.Uri.parse(
            extracted.ecosystem === 'npm'
              ? `https://www.npmjs.com/search?q=${encodeURIComponent(extracted.packageName)}`
              : `https://pypi.org/search/?q=${encodeURIComponent(extracted.packageName)}`
          )
        };

        diagnostics.push(diagnostic);
      } else if (metadata.status === 'suspicious') {
        const range = new vscode.Range(
          new vscode.Position(extracted.line, extracted.startChar),
          new vscode.Position(extracted.line, extracted.endChar)
        );

        const message = `[PHANTOMGUARD // SUSPICIOUS ARTIFACT] Package "${extracted.packageName}" has exceptionally low activity (<1k weekly downloads). Verify author authenticity.`;
        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);
        diagnostic.source = 'PhantomGuard';
        diagnostics.push(diagnostic);
      }
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  public clearForDocument(document: vscode.TextDocument): void {
    this.diagnosticCollection.delete(document.uri);
  }

  public clearAll(): void {
    this.diagnosticCollection.clear();
  }

  public dispose(): void {
    this.diagnosticCollection.dispose();
  }
}
