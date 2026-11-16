import * as vscode from 'vscode';
import { ScanManager } from './scanners/scanManager';
import { DiagnosticsProvider } from './diagnostics/diagnosticsProvider';
import { FuturisticHoverProvider } from './providers/hoverProvider';
import { FuturisticCodeActionProvider } from './providers/codeActionProvider';
import { StatusBarManager } from './statusBar/statusBar';
import { DashboardWebview } from './views/dashboardWebview';
import { PackageCache } from './cache/packageCache';

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('PhantomGuard');
  outputChannel.appendLine('╔════════════════════════════════════════════════════════════╗');
  outputChannel.appendLine('║ 🛡️ PHANTOMGUARD // AI HALLUCINATED PACKAGE SENTINEL         ║');
  outputChannel.appendLine('║ Initialized. Real-time telemetry armed and monitoring.     ║');
  outputChannel.appendLine('╚════════════════════════════════════════════════════════════╝');

  const diagnostics = new DiagnosticsProvider();
  const statusBar = new StatusBarManager();
  const hoverProvider = new FuturisticHoverProvider();
  const codeActionProvider = new FuturisticCodeActionProvider();

  const supportedLanguages = [
    'javascript',
    'javascriptreact',
    'typescript',
    'typescriptreact',
    'python'
  ];

  // Register hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      supportedLanguages.map((lang) => ({ language: lang })),
      hoverProvider
    )
  );

  // Register code actions (Quick Fix)
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      supportedLanguages.map((lang) => ({ language: lang })),
      codeActionProvider,
      {
        providedCodeActionKinds: FuturisticCodeActionProvider.providedCodeActionKinds
      }
    )
  );

  // Debounced document scanner
  let debounceTimer: NodeJS.Timeout | undefined;

  async function triggerScan(document: vscode.TextDocument) {
    if (!supportedLanguages.includes(document.languageId)) {
      return;
    }

    statusBar.setScanning();
    try {
      const results = await ScanManager.scanDocument(document);
      diagnostics.updateDiagnostics(document, results);

      const phantoms = results.filter(
        (r) => !r.metadata.exists || r.metadata.status === 'phantom'
      );
      const verified = results.filter(
        (r) => r.metadata.exists && r.metadata.status === 'verified'
      );

      statusBar.updateStatus(phantoms.length, verified.length);

      if (phantoms.length > 0) {
        outputChannel.appendLine(
          `[ALERT] ${document.fileName}: ${phantoms.length} phantom package(s) detected: ${phantoms.map((p) => p.extracted.packageName).join(', ')}`
        );
      }
    } catch (err: any) {
      outputChannel.appendLine(`[ERROR] Scan failed: ${err.message}`);
    }
  }

  function queueScan(document: vscode.TextDocument) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      triggerScan(document);
    }, 600);
  }

  // Event listeners
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => queueScan(e.document)),
    vscode.workspace.onDidOpenTextDocument((doc) => triggerScan(doc)),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        triggerScan(editor.document);
      }
    }),
    vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.clearForDocument(doc))
  );

  // Scan current active editor on startup
  if (vscode.window.activeTextEditor) {
    triggerScan(vscode.window.activeTextEditor.document);
  }

  // Command: Scan Current File
  context.subscriptions.push(
    vscode.commands.registerCommand('phantomguard.scanCurrentFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('PhantomGuard: No active file open to scan.');
        return;
      }
      await triggerScan(editor.document);
      vscode.window.showInformationMessage('🛡️ [PhantomGuard] Current file scan complete.');
    })
  );

  // Command: Deep Scan Workspace
  context.subscriptions.push(
    vscode.commands.registerCommand('phantomguard.scanWorkspace', async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'PhantomGuard: Executing Deep Workspace Recon...',
          cancellable: false
        },
        async (progress) => {
          const files = await vscode.workspace.findFiles(
            '**/*.{js,jsx,ts,tsx,py}',
            '**/node_modules/**'
          );

          let totalScanned = 0;
          let phantomsFound = 0;

          for (const file of files) {
            progress.report({
              message: `Analyzing ${file.path.split('/').pop()} (${totalScanned}/${files.length})`
            });
            try {
              const doc = await vscode.workspace.openTextDocument(file);
              const results = await ScanManager.scanDocument(doc);
              diagnostics.updateDiagnostics(doc, results);

              const phantoms = results.filter(
                (r) => !r.metadata.exists || r.metadata.status === 'phantom'
              );
              phantomsFound += phantoms.length;
              totalScanned++;
            } catch {
              // ignore file read error
            }
          }

          if (phantomsFound > 0) {
            vscode.window.showErrorMessage(
              `🚨 [PhantomGuard] Recon Complete: ${phantomsFound} phantom package(s) detected across ${totalScanned} files!`
            );
          } else {
            vscode.window.showInformationMessage(
              `🛡️ [PhantomGuard] Recon Complete: ${totalScanned} files analyzed. Zero phantom dependencies detected!`
            );
          }

          if (DashboardWebview.currentPanel) {
            DashboardWebview.currentPanel.update();
          }
        }
      );
    })
  );

  // Command: Open Dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand('phantomguard.openDashboard', () => {
      DashboardWebview.createOrShow(context.extensionUri);
    })
  );

  // Command: Clear Cache
  context.subscriptions.push(
    vscode.commands.registerCommand('phantomguard.clearCache', () => {
      PackageCache.clear();
      diagnostics.clearAll();
      vscode.window.showInformationMessage('🛡️ [PhantomGuard] Package registry cache purged.');
      if (vscode.window.activeTextEditor) {
        triggerScan(vscode.window.activeTextEditor.document);
      }
      if (DashboardWebview.currentPanel) {
        DashboardWebview.currentPanel.update();
      }
    })
  );

  // Command: Whitelist Package
  context.subscriptions.push(
    vscode.commands.registerCommand('phantomguard.whitelistPackage', async (pkgName?: string) => {
      let target = pkgName;
      if (!target) {
        target = await vscode.window.showInputBox({
          prompt: 'Enter the exact name of the package to trust and whitelist:',
          placeHolder: 'e.g., @mycompany/private-utils'
        });
      }

      if (target) {
        await PackageCache.addToWhitelist(target);
        vscode.window.showInformationMessage(
          `🛡️ [PhantomGuard] Package "${target}" added to trusted whitelist.`
        );
        if (vscode.window.activeTextEditor) {
          triggerScan(vscode.window.activeTextEditor.document);
        }
        if (DashboardWebview.currentPanel) {
          DashboardWebview.currentPanel.update();
        }
      }
    })
  );

  context.subscriptions.push(diagnostics, statusBar, outputChannel);
}

export function deactivate() {
  if (DashboardWebview.currentPanel) {
    DashboardWebview.currentPanel.dispose();
  }
}
