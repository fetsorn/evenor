---
status: proposed
date: 2026-06-22
decision-makers: fetsorn
---

# ADR-0002: Evenor mode system with hidden debug mode

## Context and Problem Statement

Evenor currently delegates all UI to mindbook. When IndexedDB gets corrupted — half-written LightningFS state, failed seed, interrupted merge — the app enters a fugue state: stuck on "initializing..." or showing an error string with no recovery path. On desktop, DevTools can inspect and delete IndexedDB. On phone there is nothing. No logs, no inspector, no way to even delete the database and start over. The app is bricked until you find a desktop browser.

Beyond debugging, evenor will need other views that mindbook doesn't provide (graph view, etc.). Mindbook is one way to look at the data, not the only way.

## Decision Drivers

* On phone, a corrupted IndexedDB is unrecoverable — no DevTools, no way to inspect or delete
* `console.log` output is invisible without a desktop debugger attached
* Mindbook owns `#root` completely; there is no evenor-level UI to fall back to
* Future modes (graph view, others) will need the same shell pattern

## Considered Options

1. Mode system in evenor with debug as first non-mindbook mode
2. Debug panel as an overlay within mindbook (extend mindbook API)
3. Standalone debug script loaded independently of evenor's bundle

## Decision Outcome

Chosen option: "Mode system in evenor," because the debug panel must work when mindbook is stuck, and because the same shell will host future modes (graph view, etc.). Mindbook becomes one mode, not the mode.

### Architecture

**Mode system** (`src/modes/`):
- Each mode exports `mount(container, ctx)` / `unmount()`
- `ctx` carries `fs`, `api`, app state — whatever is available at the time
- `index.js` owns `#root`, manages current mode, passes context
- `modes/mind.js` wraps mindbook — calls `book.bind(container)` inside `mount`
- `modes/debug.js` — xterm.js terminal with commands wired to `fs` and isogit

**Activation**:
- Seven taps on `document` within 3 seconds, capture phase (like Android developer mode)
- Hidden for now; a visible mode menu may come later

**Debug panel**:
- xterm.js terminal as the primary interface — type commands, see output, same mental model as a real shell
- **Log buffer**: monkey-patch `console.log`/`.error`/`.warn` at module load into a ring buffer; `logs` command dumps it
- Commands wired to LightningFS (`ls`, `cat`, `cd`), isogit (`git log`, `git status`), IndexedDB (`idb`), app state (`state`), and danger zone (`rm`, `wipe`) — set is extensible over time
- Danger-zone commands (`rm`, `wipe`) require confirmation

### What doesn't change

- Mindbook's API and behavior are untouched
- `mind.js` wraps the existing `book.bind()` / `book.open()` / `crud` pattern
- The popstate listener and URL routing stay in `index.js`

## Links

- ADR-0001: decompose evenor
