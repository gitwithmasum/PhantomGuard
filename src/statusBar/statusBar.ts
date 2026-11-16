import * as vscode from 'vscode';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'phantomguard.openDashboard';
    this.updateStatus(0, 0);
    this.statusBarItem.show();
  }

  public updateStatus(phantomCount: number, totalVerified: number): void {
    if (phantomCount > 0) {
      this.statusBarItem.text = `$(alert) PHANTOMGUARD: ${phantomCount} THREAT${phantomCount > 1 ? 'S' : ''}`;
      this.statusBarItem.tooltip = `🚨 PhantomGuard Alert: ${phantomCount} non-existent package(s) detected in current buffer! Click to open Cyber Radar.`;
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        'statusBarItem.errorBackground'
      );
    } else {
      this.statusBarItem.text = `$(shield) PHANTOMGUARD: SECURE`;
      this.statusBarItem.tooltip = `🛡️ PhantomGuard Cyber-Sentinel: All external dependencies verified (${totalVerified} verified). Click for Defense Radar.`;
      this.statusBarItem.backgroundColor = undefined;
    }
  }

  public setScanning(): void {
    this.statusBarItem.text = `$(sync~spin) PHANTOMGUARD: SCANNING...`;
    this.statusBarItem.tooltip = `Scanning document against official registry telemetry...`;
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
