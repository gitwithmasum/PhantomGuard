import * as vscode from 'vscode';
import { PackageEcosystem, PackageMetadata } from '../types';

export class PackageCache {
  private static cache = new Map<string, PackageMetadata>();
  private static readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  private static getCacheKey(ecosystem: PackageEcosystem, name: string): string {
    return `${ecosystem}:${name.toLowerCase()}`;
  }

  public static get(ecosystem: PackageEcosystem, name: string): PackageMetadata | undefined {
    const key = this.getCacheKey(ecosystem, name);
    const item = this.cache.get(key);
    if (!item) {
      return undefined;
    }

    // Check expiration
    if (Date.now() - item.verifiedAt > this.TTL_MS) {
      this.cache.delete(key);
      return undefined;
    }

    return item;
  }

  public static set(metadata: PackageMetadata): void {
    const key = this.getCacheKey(metadata.ecosystem, metadata.name);
    this.cache.set(key, metadata);
  }

  public static isWhitelisted(name: string): boolean {
    const config = vscode.workspace.getConfiguration('phantomguard');
    const whitelist = config.get<string[]>('whitelist', []);
    const lowerName = name.toLowerCase();
    return whitelist.some((w) => w.toLowerCase() === lowerName);
  }

  public static async addToWhitelist(name: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('phantomguard');
    const whitelist = config.get<string[]>('whitelist', []);
    if (!whitelist.includes(name)) {
      whitelist.push(name);
      await config.update('whitelist', whitelist, vscode.ConfigurationTarget.Global);
    }
  }

  public static clear(): void {
    this.cache.clear();
  }

  public static getAll(): PackageMetadata[] {
    return Array.from(this.cache.values());
  }
}
