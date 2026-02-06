# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Evenor is a plain-text database manager built with **Tauri v2** (Rust backend) and **SolidJS** (JavaScript frontend). It runs as both a native desktop/mobile app and a browser-only web app through a platform abstraction layer.

Data is stored in **CSVS** (Comma Separated Value Store) format — CSV files inside Git repositories. Each dataset is called a "mind."

## Build & Development Commands

```bash
yarn                     # Install dependencies
yarn dev                 # Vite dev server (browser mode, port 1420)
yarn tauri dev           # Tauri dev mode (native app)
yarn build               # Build browser version
yarn tauri build         # Build native app

yarn test                # Unit tests (Vitest + Firefox headless)
yarn lint                # ESLint
yarn wdio-browser        # Browser integration tests (WebdriverIO)
yarn wdio-tauri          # Tauri integration tests (WebdriverIO + tauri-driver)
```

Unit tests live alongside source files as `*.test.js` / `*.test.jsx`. Integration tests are in `src/test/browser/` and `src/test/tauri/`.

## Architecture

### Dual-Platform Abstraction

The key architectural pattern: `src/api/index.js` selects between browser and Tauri implementations at build time via the `__BUILD_MODE__` define (set from `BUILD_MODE` env var or `TAURI_ENV_PLATFORM`).

- **Browser mode** (`src/api/browser/`): Uses isomorphic-git, Lightning FS (IndexedDB), and csvs-js for all operations in pure JavaScript.
- **Tauri mode** (`src/api/tauri/index.js`): Calls Rust backend via Tauri `invoke()` IPC. Backend code is in `src-tauri/src/` using csvs-rs and git2kit.

Both platforms export the same API surface (select, selectStream, updateRecord, deleteRecord, buildRecord, init, clone, commit, resolve, etc.). Always import from `@/api/index.js`, never from platform-specific modules directly.

### Frontend (src/)

- **`src/layout/`** — SolidJS UI components organized by area (overview, profile, navigation, bottom bar)
- **`src/store/`** — State management with solid-js/store. Actions in `action.js`, pure functions in `pure.js`, side effects in `impure.js`
- **`src/api/`** — Platform abstraction layer (described above)

URL parameters drive application state: `/_=mind` for base type, `/rootmind#_=record&field=value` for mind and query params.

### Backend (src-tauri/src/)

- **`db.rs`** — Database operations (select, update, delete, build_record)
- **`git.rs`** — Git operations (init, clone, commit, resolve)
- **`lfs.rs`** — Git LFS operations
- **`mind/`** — Mind (dataset) management: finding, creating, naming, storage paths
- **`lib.rs`** — Tauri command definitions and mobile entry point
- **`main.rs`** — Desktop entry point with CLI (`-d/--data-dir` flag)

### Adding a New API Method

1. Implement browser version in `src/api/browser/*.js`
2. Add Rust `#[tauri::command]` in `src-tauri/src/` and register in `lib.rs`
3. Add `invoke()` call in `src/api/tauri/index.js`
4. Export from `src/api/index.js`

## Important Dependencies

- **csvs-rs** (Rust crate): Referenced via local path `../../csvs-rs` — must be cloned alongside this repo to build the Tauri app
- **@fetsorn/csvs-js**: JavaScript CSVS implementation for browser mode
- **isomorphic-git / @fetsorn/isogit-lfs**: Git operations in the browser
- **git2kit**: Rust Git operations via libgit2

## Build-Time Variables

- `__BUILD_MODE__`: `"browser"` or platform name — controls API implementation selection
- `__COMMIT_HASH__`: Short git hash injected at build time

## Path Alias

`@` is aliased to `./src/` in vite.config.js — use `@/api/...`, `@/store/...`, etc.
