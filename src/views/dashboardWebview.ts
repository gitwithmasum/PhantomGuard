import * as vscode from 'vscode';
import { PackageCache } from '../cache/packageCache';

export class DashboardWebview {
  public static currentPanel: DashboardWebview | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (DashboardWebview.currentPanel) {
      DashboardWebview.currentPanel._panel.reveal(column);
      DashboardWebview.currentPanel.update();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'phantomGuardDashboard',
      'PHANTOMGUARD // CYBER-RADAR',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    DashboardWebview.currentPanel = new DashboardWebview(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this.update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'deepScan':
            await vscode.commands.executeCommand('phantomguard.scanWorkspace');
            this.update();
            break;
          case 'purgeCache':
            await vscode.commands.executeCommand('phantomguard.clearCache');
            this.update();
            break;
          case 'whitelist':
            if (message.pkgName) {
              await PackageCache.addToWhitelist(message.pkgName);
              vscode.window.showInformationMessage(
                `🛡️ [PhantomGuard] Added "${message.pkgName}" to trusted whitelist.`
              );
              this.update();
            }
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public update(): void {
    this._panel.webview.html = this._getHtmlForWebview();
  }

  private _getHtmlForWebview(): string {
    const packages = PackageCache.getAll();
    const phantomCount = packages.filter((p) => !p.exists || p.status === 'phantom').length;
    const verifiedCount = packages.filter((p) => p.exists && p.status === 'verified').length;
    const totalCount = packages.length;

    const rows = packages
      .map((pkg) => {
        const isPhantom = !pkg.exists || pkg.status === 'phantom';
        const statusBadge = isPhantom
          ? `<span class="badge phantom">🚨 PHANTOM</span>`
          : `<span class="badge verified">✅ VERIFIED</span>`;

        const details = isPhantom
          ? `<span class="danger-text">NOT FOUND ON ${pkg.ecosystem.toUpperCase()}</span>`
          : `v${pkg.version || 'latest'} • ${(pkg.weeklyDownloads || 0).toLocaleString()} dl/wk`;

        const actionBtn = isPhantom
          ? `<button class="btn-action" onclick="whitelist('${pkg.name}')">Whitelist</button>`
          : `<span class="clean-tag">Secure</span>`;

        return `
          <tr>
            <td><strong class="pkg-name">${pkg.name}</strong></td>
            <td><span class="eco-tag ${pkg.ecosystem}">${pkg.ecosystem.toUpperCase()}</span></td>
            <td>${statusBadge}</td>
            <td>${details}</td>
            <td>${actionBtn}</td>
          </tr>
        `;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PhantomGuard Cyber-Radar</title>
  <style>
    :root {
      --bg: #050811;
      --card-bg: rgba(13, 20, 38, 0.85);
      --border: #1a2a4d;
      --cyan: #00f0ff;
      --magenta: #ff0055;
      --green: #00ff66;
      --amber: #ffaa00;
      --text: #e1e7f5;
      --muted: #6b7d9e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 10%, #0d1a38 0%, #040711 90%);
      color: var(--text);
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      padding: 30px;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .hud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--cyan);
      padding-bottom: 20px;
      margin-bottom: 25px;
      box-shadow: 0 4px 20px rgba(0, 240, 255, 0.15);
    }
    .hud-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .radar-icon {
      width: 32px;
      height: 32px;
      border: 2px solid var(--cyan);
      border-radius: 50%;
      position: relative;
      animation: pulse 2s infinite linear;
    }
    .radar-icon::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 4px;
      background: var(--cyan);
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(0, 240, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
    }
    h1 {
      font-size: 24px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 0 10px var(--cyan);
    }
    .subtitle {
      font-size: 12px;
      color: var(--cyan);
      letter-spacing: 1px;
    }
    .actions-bar {
      display: flex;
      gap: 12px;
    }
    button {
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid var(--cyan);
      color: var(--cyan);
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    button:hover {
      background: var(--cyan);
      color: #000;
      box-shadow: 0 0 15px var(--cyan);
    }
    button.btn-danger {
      border-color: var(--magenta);
      color: var(--magenta);
      background: rgba(255, 0, 85, 0.1);
    }
    button.btn-danger:hover {
      background: var(--magenta);
      color: #fff;
      box-shadow: 0 0 15px var(--magenta);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    }
    .stat-card.threat {
      border-color: var(--magenta);
      box-shadow: 0 0 20px rgba(255, 0, 85, 0.2);
    }
    .stat-card.verified {
      border-color: var(--green);
      box-shadow: 0 0 20px rgba(0, 255, 102, 0.15);
    }
    .stat-value {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-top: 5px;
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--muted);
    }
    .threat .stat-value { color: var(--magenta); text-shadow: 0 0 12px var(--magenta); }
    .verified .stat-value { color: var(--green); text-shadow: 0 0 12px var(--green); }
    .total .stat-value { color: var(--cyan); text-shadow: 0 0 12px var(--cyan); }

    .telemetry-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .telemetry-table th {
      text-align: left;
      padding: 14px 18px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--cyan);
      background: rgba(0, 240, 255, 0.05);
      border-bottom: 1px solid var(--border);
    }
    .telemetry-table td {
      padding: 14px 18px;
      font-size: 13px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .pkg-name {
      color: #fff;
      font-family: monospace;
      font-size: 14px;
    }
    .eco-tag {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
    }
    .eco-tag.npm { background: rgba(203, 56, 55, 0.2); color: #ff5555; border: 1px solid #cb3837; }
    .eco-tag.pypi { background: rgba(55, 117, 169, 0.2); color: #38bdf8; border: 1px solid #3775a9; }
    .badge {
      font-size: 11px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .badge.phantom {
      background: rgba(255, 0, 85, 0.2);
      color: var(--magenta);
      border: 1px solid var(--magenta);
      box-shadow: 0 0 8px rgba(255, 0, 85, 0.4);
    }
    .badge.verified {
      background: rgba(0, 255, 102, 0.15);
      color: var(--green);
      border: 1px solid var(--green);
    }
    .danger-text { color: var(--magenta); font-weight: 600; font-size: 11px; }
    .clean-tag { color: var(--muted); font-size: 12px; }
    .btn-action {
      padding: 4px 10px;
      font-size: 10px;
      border-color: var(--amber);
      color: var(--amber);
      background: rgba(255, 170, 0, 0.1);
    }
    .btn-action:hover {
      background: var(--amber);
      color: #000;
      box-shadow: 0 0 10px var(--amber);
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--muted);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="hud-header">
    <div class="hud-title">
      <div class="radar-icon"></div>
      <div>
        <h1>PhantomGuard</h1>
        <div class="subtitle">CYBER-SENTINEL TELEMETRY // AI HALLUCINATION RADAR</div>
      </div>
    </div>
    <div class="actions-bar">
      <button onclick="deepScan()">⚡ Workspace Recon</button>
      <button class="btn-danger" onclick="purgeCache()">Purge Cache</button>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card threat">
      <div class="stat-label">🚨 Phantoms Blocked</div>
      <div class="stat-value">${phantomCount}</div>
    </div>
    <div class="stat-card verified">
      <div class="stat-label">✅ Verified Clean</div>
      <div class="stat-value">${verifiedCount}</div>
    </div>
    <div class="stat-card total">
      <div class="stat-label">🔍 Total Audited</div>
      <div class="stat-value">${totalCount}</div>
    </div>
  </div>

  <table class="telemetry-table">
    <thead>
      <tr>
        <th>Package Identifier</th>
        <th>Ecosystem</th>
        <th>Security Verdict</th>
        <th>Registry Telemetry</th>
        <th>Counter-Action</th>
      </tr>
    </thead>
    <tbody>
      ${rows.length > 0 ? rows : '<tr><td colspan="5" class="empty-state">No packages scanned yet. Open a JS, TS or Python file to begin real-time telemetry.</td></tr>'}
    </tbody>
  </table>

  <script>
    const vscode = acquireVsCodeApi();
    function deepScan() {
      vscode.postMessage({ command: 'deepScan' });
    }
    function purgeCache() {
      vscode.postMessage({ command: 'purgeCache' });
    }
    function whitelist(pkgName) {
      vscode.postMessage({ command: 'whitelist', pkgName });
    }
  </script>
</body>
</html>`;
  }

  public dispose(): void {
    DashboardWebview.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
