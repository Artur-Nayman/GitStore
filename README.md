# GitStore

Zero-Infrastructure Open Source App Marketplace

## Overview

GitStore is a decentralized application marketplace client that discovers, filters, and installs software directly from GitHub. Built with Tauri v2, React, and TypeScript — requiring zero backend servers.

## Features

- **Dynamic Advanced Search** — Search with granular filters (platform, category, language)
- **Smart Asset Parsing** — Auto-detect `.apk`, `.exe`, `.msi`, `.deb`, `.rpm`, `.AppImage` binaries
- **Secure OAuth** — GitHub authentication with 5,000 requests/hour rate limit
- **Local Caching** — SQLite-backed read-through cache for instant results
- **Cross-Platform** — Windows, Linux, Android support via Tauri v2

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Client | Tauri v2 + React + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Local DB | SQLite (rusqlite) |
| Serverless | Vercel Functions (Node.js) |

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

## Configuration

1. Copy `.env.example` to `.env`
2. Create a GitHub OAuth App at `github.com/settings/developers`
3. Set `VITE_GITHUB_CLIENT_ID` and `VITE_OAUTH_REDIRECT_URL`

## OAuth Flow

```
[ GitStore App ] → Opens browser → [ GitHub Auth ]
       ↑                                    |
       |                            (User authorizes)
       |                                    ↓
       ← Deep link: gitstore://oauth?token=... ← [ Serverless Function ]
```

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
└── serverless/               # OAuth helper function
    └── api/oauth.ts          # Vercel serverless function
```

## License

MIT
