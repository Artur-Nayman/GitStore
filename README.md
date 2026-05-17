# GitStore

Zero-Infrastructure Open Source App Marketplace

## Overview

GitStore is a decentralized application marketplace client that discovers, filters, and installs software directly from GitHub. Built with Tauri v2, React, and TypeScript — **no servers, no APIs, no external services**.

## Features

- **Dynamic Advanced Search** — Search with granular filters (platform, category, language)
- **Smart Asset Parsing** — Auto-detect `.apk`, `.exe`, `.msi`, `.deb`, `.rpm`, `.AppImage` binaries
- **Optional GitHub Token** — Paste a Personal Access Token for 5,000 req/hr (vs 60 unauthenticated)
- **Local Caching** — SQLite-backed read-through cache for instant results
- **Cross-Platform** — Windows, Linux, Android support via Tauri v2
- **100% Local** — No servers, no tracking, no external dependencies

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Client | Tauri v2 + React + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Local DB | SQLite (rusqlite) |

## Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Tauri CLI (`cargo install tauri-cli`)

### Installation

```bash
npm install
cd src-tauri
cargo build
cd ..
```

### Development

```bash
npm run tauri:dev
```

### Build

```bash
npm run tauri:build
```

## Authentication

GitStore works **without any authentication** — just search and browse (60 requests/hour).

For higher rate limits (5,000 requests/hour):

1. Go to [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. Give it a name (e.g., "GitStore")
3. **No scopes needed** — leave all checkboxes unchecked
4. Click "Generate token"
5. Paste the token in GitStore Settings

That's it. No servers. No OAuth. No external services.

## Project Structure

```
GitStore/
├── src/                      # React frontend
│   ├── components/           # UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities (categories, platforms)
│   ├── pages/                # Route pages
│   └── store/                # Zustand stores
├── src-tauri/                # Tauri Rust backend
│   ├── src/
│   │   ├── commands/         # Tauri IPC commands
│   │   ├── db/               # SQLite setup
│   │   └── utils/            # Helper functions
│   └── tauri.conf.json       # App configuration
```

## License

MIT
