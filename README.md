<div align="center">

<img src="./assets/banner.png" alt="PhantomGuard Banner" width="100%" />

# 🛡️ PhantomGuard
### *Real-Time Cybernetic Defense Against AI-Hallucinated & Phantom Packages*

[![Version](https://img.shields.io/badge/version-0.1.0-00f0ff?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://github.com/gitwithmasum/PhantomGuard)
[![License](https://img.shields.io/badge/license-MIT-7000ff?style=for-the-badge)](LICENSE)
[![Ecosystem](https://img.shields.io/badge/ecosystem-NPM%20%7C%20PyPI-00ff66?style=for-the-badge)](https://github.com/gitwithmasum/PhantomGuard)
[![Defense](https://img.shields.io/badge/threat_model-CWE--1384-ff0055?style=for-the-badge)](https://cwe.mitre.org)

</div>

---

## 🚨 The Threat Vector: AI Package Hallucination & Slopsquatting

Modern developers rely heavily on Large Language Models (**GitHub Copilot, ChatGPT, Claude, Cursor**) to generate code. While powerful, these models suffer from a dangerous flaw: **hallucinating fictitious package names**.

When an AI suggests:
```typescript
import { createMagicModal } from 'react-magic-modal-assistant'; // 🚨 DOES NOT EXIST
```
Attackers monitor popular hallucinated package names, register malicious packages under those exact names on **npm** or **PyPI**, and wait for developers to unknowingly execute:
```bash
npm install react-magic-modal-assistant # 💣 MALICIOUS PAYLOAD EXECUTED
```

**PhantomGuard** is a cybernetic sentinel running silently inside VS Code. It intercepts every import statement in real-time, cross-references it with live official registries (`registry.npmjs.org` and `pypi.org`), and alerts you before a phantom dependency ever touches your disk.

---

## ⚡ Futuristic Capabilities

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  [TELEMETRY] PHANTOMGUARD SENTINEL INTERFACE                                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  • Real-Time Interception : Instant registry lookups on JS, TS & Python imports║
║  • Cyber-HUD Hover Card   : Futuristic diagnostics displaying live metrics    ║
║  • Cybernetic Radar       : Full-screen interactive threat monitoring console ║
║  • 1-Click Neutralization : Instant Quick Fix actions to isolate threats      ║
║  • Zero Lag Architecture  : 24hr LRU cache + debounced non-blocking workers   ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### 1. 🛡️ Real-Time Hallucination Interception
As you type or paste AI-generated code, PhantomGuard checks whether the package exists on the official registry. Non-existent packages are highlighted with an unmistakable high-contrast cyber-warning.

### 2. 🛸 Cyberpunk HUD Hover Cards
Hover over any package import to inspect its live registry telemetry:
- **Registry Status:** Verified Active / Non-Existent
- **Weekly Downloads:** Download momentum from npm/PyPI
- **Deprecation Status:** Immediate flags on deprecated libraries
- **Direct Registry Links & Whitelist Triggers**

### 3. 🌐 Cyber-Radar Security Dashboard
Press `Ctrl+Shift+P` and launch `PhantomGuard: Open Cybernetic Radar Dashboard`. Access an interactive, dark neon sci-fi command center featuring:
- Live count of blocked phantoms vs verified clean dependencies
- Full workspace reconnaissance trigger
- Direct whitelist management for private or proprietary company packages

### 4. 🛠️ Automated Quick Fixes (`Ctrl + .`)
When a phantom package is discovered, PhantomGuard provides immediate counter-actions:
- **`Neutralize`**: Deletes the hallucinated import line with 1 click.
- **`Annotate`**: Inserts a security annotation comment above the import.
- **`Whitelist`**: Trusts internal or monorepo packages across your workspace.

---

## 🚀 Supported Ecosystems & Languages

| Ecosystem | Registry Source | Supported Languages |
| :--- | :--- | :--- |
| **npm** | `registry.npmjs.org` | JavaScript (`.js`), TypeScript (`.ts`), React (`.jsx`, `.tsx`) |
| **PyPI** | `pypi.org` | Python (`.py`) |

> *Native built-in modules (`fs`, `path`, `os`, `sys`, etc.) and relative path imports (`./`, `../`, `@/`) are automatically recognized and exempted from registry telemetry.*

---

## ⚙️ Configuration

Customize PhantomGuard via VS Code Settings (`Ctrl + ,` -> search `PhantomGuard`):

```json
{
  // Enable or disable real-time npm verification
  "phantomguard.enableNpm": true,

  // Enable or disable real-time PyPI verification
  "phantomguard.enablePypi": true,

  // Flag packages with < 1,000 weekly downloads as suspicious
  "phantomguard.strictMode": false,

  // List of private/internal packages to always trust
  "phantomguard.whitelist": [
    "@my-org/core-utils",
    "internal-company-sdk"
  ]
}
```

---

## 🎮 Command Palette Shortcuts

| Command | Action |
| :--- | :--- |
| `PhantomGuard: Open Cybernetic Radar Dashboard` | Opens the full-screen sci-fi monitoring HUD |
| `PhantomGuard: Deep Scan Workspace for Hallucinations` | Audits every code file in the project |
| `PhantomGuard: Scan Current File for Phantoms` | Force-rescans active buffer |
| `PhantomGuard: Purge Local Registry Cache` | Flushes local telemetry cache |

---

## 🛠️ Building & Contributing Locally

Clone and run in your development environment:

```bash
# 1. Clone the repository
git clone https://github.com/gitwithmasum/PhantomGuard.git
cd PhantomGuard

# 2. Install dependencies
npm install

# 3. Build with high-speed esbuild bundler
npm run build

# 4. Run tests
npm test
```

Press **`F5`** inside VS Code to launch the **Extension Development Host** and test in real-time.

---

## 📜 Security & Privacy
PhantomGuard strictly makes read-only metadata queries directly to the public **npm** and **PyPI** APIs. No source code, project files, or private variables are ever sent or logged over the network.

---

## 👤 Author & Maintainer

**Masum Billah**  
- GitHub: [@gitwithmasum](https://github.com/gitwithmasum)  
- Email: [sciencefiction844@gmail.com](mailto:sciencefiction844@gmail.com)  
- Repository: [https://github.com/gitwithmasum/PhantomGuard](https://github.com/gitwithmasum/PhantomGuard)

---

<div align="center">
  <sub>Engineered with precision. Defend your codebase against phantom AI dependencies.</sub>
</div>
