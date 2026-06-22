import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import git from "isomorphic-git";
import { logs } from "@/log-capture.js";

let container;
let terminal;
let fitAddon;
let resizeObserver;
let refreshInterval;

export async function mount(el, ctx) {
  container = el;
  container.innerHTML = "";

  const style = document.createElement("style");
  style.textContent = `
    #debug-top {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #1a1a1a;
      padding: 8px 16px;
      border-bottom: 1px solid #333;
    }
    #debug-top button {
      font-family: monospace;
      padding: 6px 12px;
      margin-right: 8px;
      border: 1px solid #555;
      background: #2a2a2a;
      color: #e0e0e0;
      border-radius: 4px;
      cursor: pointer;
    }
    #debug-top button:hover { background: #3a3a3a; }
    #debug-term {
      height: 50vh;
      min-height: 200px;
      background: #111;
    }
    #debug-rest {
      font-family: monospace;
      font-size: 14px;
      padding: 16px;
      color: #e0e0e0;
      background: #1a1a1a;
    }
    #debug-rest h2 {
      margin: 24px 0 8px;
      font-size: 16px;
      color: #9e9e9e;
      border-bottom: 1px solid #333;
      padding-bottom: 4px;
    }
    #debug-rest .log-entry {
      padding: 2px 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    #debug-rest .log-entry.warn { color: #ffb74d; }
    #debug-rest .log-entry.error { color: #ef5350; }
    #debug-rest .log-list {
      max-height: 200px;
      overflow-y: auto;
      background: #111;
      padding: 8px;
      border-radius: 4px;
    }
    #debug-rest .tree-item {
      padding: 2px 0;
      cursor: pointer;
    }
    #debug-rest .tree-item:hover { background: #333; }
    #debug-rest .idb-store {
      margin-left: 16px;
      color: #90caf9;
    }
    #debug-rest button {
      font-family: monospace;
      padding: 8px 16px;
      margin: 4px;
      border: 1px solid #555;
      background: #2a2a2a;
      color: #e0e0e0;
      border-radius: 4px;
      cursor: pointer;
    }
    #debug-rest button:hover { background: #3a3a3a; }
    #debug-rest button.danger {
      border-color: #ef5350;
      color: #ef5350;
    }
    #debug-rest button.danger:hover { background: #3a2020; }
  `;

  container.appendChild(style);

  // Sticky top bar with back button
  const topBar = document.createElement("div");
  topBar.id = "debug-top";
  const backBtn = document.createElement("button");
  backBtn.textContent = "← back to app";
  backBtn.onclick = () => location.reload();
  topBar.appendChild(backBtn);
  container.appendChild(topBar);

  // Terminal fills top half
  const termWrapper = document.createElement("div");
  termWrapper.id = "debug-term";
  container.appendChild(termWrapper);

  terminal = new Terminal({
    cursorBlink: true,
    fontSize: 13,
    theme: {
      background: "#111",
      foreground: "#e0e0e0",
      cursor: "#e0e0e0",
    },
  });

  fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(termWrapper);

  requestAnimationFrame(() => {
    fitAddon.fit();
    terminal.focus();
  });

  resizeObserver = new ResizeObserver(() => fitAddon.fit());
  resizeObserver.observe(termWrapper);

  const shell = createShell(terminal, ctx);

  terminal.writeln("evenor debug shell — type `help` for commands");
  terminal.writeln("");
  shell.prompt();

  // Scrollable panels below the terminal
  const rest = document.createElement("div");
  rest.id = "debug-rest";
  container.appendChild(rest);

  // Logs
  const logsSection = section(rest, "logs");
  const logList = document.createElement("div");
  logList.className = "log-list";
  logsSection.appendChild(logList);

  function renderLogs() {
    logList.innerHTML = "";
    for (const entry of logs) {
      const div = document.createElement("div");
      div.className = `log-entry ${entry.level}`;
      const time = new Date(entry.time).toLocaleTimeString();
      div.textContent = `[${time}] ${entry.level}: ${entry.message}`;
      logList.appendChild(div);
    }
    logList.scrollTop = logList.scrollHeight;
  }
  renderLogs();
  refreshInterval = setInterval(renderLogs, 2000);

  // Filesystem
  if (ctx.fs) {
    const fsSection = section(rest, "filesystem");
    await renderFS(fsSection, ctx.fs);
  }

  // Danger zone
  const dangerSection = section(rest, "danger zone");
  renderDangerZone(dangerSection);
}

export function unmount() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (terminal) {
    terminal.dispose();
    terminal = null;
  }
  fitAddon = null;
  if (container) {
    container.style.cssText = "";
    container.innerHTML = "";
    container = null;
  }
}

// ── dom helpers ──────────────────────────────────────────

function section(parent, title) {
  const h2 = document.createElement("h2");
  h2.textContent = title;
  parent.appendChild(h2);
  const div = document.createElement("div");
  parent.appendChild(div);
  return div;
}

async function renderFS(el, fs) {
  try {
    await walkDir(fs, "/", el, 0);
  } catch (e) {
    el.textContent = `cannot read filesystem: ${e.message}`;
  }
}

async function walkDir(fs, path, parent, depth) {
  if (depth > 3) {
    const div = document.createElement("div");
    div.className = "tree-item";
    div.style.marginLeft = `${depth * 16}px`;
    div.textContent = "…";
    parent.appendChild(div);
    return;
  }

  let entries;
  try {
    entries = await fs.promises.readdir(path);
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path === "/" ? `/${entry}` : `${path}/${entry}`;
    const div = document.createElement("div");
    div.className = "tree-item";
    div.style.marginLeft = `${depth * 16}px`;

    try {
      const stat = await fs.promises.stat(fullPath);

      if (stat.type === "dir") {
        div.textContent = `\u{1F4C1} ${entry}/`;
        parent.appendChild(div);

        let expanded = false;
        const children = document.createElement("div");
        children.style.display = "none";
        parent.appendChild(children);

        div.onclick = async () => {
          if (!expanded) {
            await walkDir(fs, fullPath, children, depth + 1);
            expanded = true;
          }
          children.style.display =
            children.style.display === "none" ? "block" : "none";
        };
      } else {
        const size = stat.size != null ? ` (${stat.size}B)` : "";
        div.textContent = `\u{1F4C4} ${entry}${size}`;
        parent.appendChild(div);
      }
    } catch {
      div.textContent = `? ${entry}`;
      parent.appendChild(div);
    }
  }
}

function renderDangerZone(el) {
  const warning = document.createElement("div");
  warning.style.cssText = "color: #ef5350; margin-bottom: 8px;";
  warning.textContent = "these actions destroy data — confirm twice";
  el.appendChild(warning);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "danger";
  deleteBtn.textContent = "delete database…";
  deleteBtn.onclick = async () => {
    deleteBtn.disabled = true;

    let databases;
    try {
      databases = await indexedDB.databases();
    } catch {
      deleteBtn.textContent = "not supported";
      return;
    }

    const picker = document.createElement("div");
    picker.style.margin = "8px 0";

    for (const db of databases) {
      const btn = document.createElement("button");
      btn.className = "danger";
      btn.textContent = `delete "${db.name}"`;
      btn.onclick = () => {
        btn.textContent = `confirm delete "${db.name}"?`;
        btn.onclick = () => {
          indexedDB.deleteDatabase(db.name);
          btn.textContent = `deleted "${db.name}" — reload to take effect`;
          btn.disabled = true;
        };
      };
      picker.appendChild(btn);
    }

    el.appendChild(picker);
  };
  el.appendChild(deleteBtn);

  const wipeBtn = document.createElement("button");
  wipeBtn.className = "danger";
  wipeBtn.textContent = "wipe all + reload";
  wipeBtn.onclick = () => {
    wipeBtn.textContent = "confirm: wipe everything and reload?";
    wipeBtn.onclick = async () => {
      try {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          indexedDB.deleteDatabase(db.name);
        }
      } catch {
        indexedDB.deleteDatabase("fs");
      }
      location.reload();
    };
  };
  el.appendChild(wipeBtn);
}

// ── shell ────────────────────────────────────────────────

function createShell(term, ctx) {
  let cwd = "/";
  let line = "";
  let history = [];
  let historyIndex = -1;
  let pendingConfirm = null;

  function confirm(message, cb) {
    term.write(`\x1b[33m${message} (y/N)\x1b[0m `);
    pendingConfirm = cb;
  }

  const commands = buildCommands(ctx, term, confirm, () => cwd, (d) => { cwd = d; });

  function prompt() {
    term.write(`\x1b[36m${cwd}\x1b[0m $ `);
  }

  function clearLine() {
    term.write(`\r\x1b[36m${cwd}\x1b[0m $ \x1b[K`);
  }

  term.onData((data) => {
    if (data === "\x1b[A") {
      if (history.length > 0 && historyIndex > 0) {
        historyIndex--;
        clearLine();
        line = history[historyIndex];
        term.write(line);
      }
      return;
    }
    if (data === "\x1b[B") {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        clearLine();
        line = history[historyIndex];
        term.write(line);
      } else {
        historyIndex = history.length;
        clearLine();
        line = "";
      }
      return;
    }
    if (data.startsWith("\x1b")) return;

    for (const ch of data) {
      handleChar(ch);
    }
  });

  function handleChar(ch) {
    switch (ch) {
      case "\r":
        term.writeln("");

        if (pendingConfirm) {
          const yes = line.trim().toLowerCase();
          const cb = pendingConfirm;
          pendingConfirm = null;
          if (yes === "y" || yes === "yes") {
            cb();
          } else {
            term.writeln("cancelled");
          }
          line = "";
          prompt();
          return;
        }

        if (line.trim()) {
          history.push(line);
          historyIndex = history.length;
          exec(line.trim());
        } else {
          prompt();
        }
        line = "";
        break;

      case "\x7f":
        if (line.length > 0) {
          line = line.slice(0, -1);
          term.write("\b \b");
        }
        break;

      case "\x03":
        line = "";
        term.writeln("^C");
        prompt();
        break;

      default:
        if (ch >= " " || ch === "\t") {
          line += ch;
          term.write(ch);
        }
    }
  }

  async function exec(input) {
    const parts = input.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    if (cmd === "git" && args.length > 0) {
      const gitCmd = `git ${args[0]}`;
      if (commands[gitCmd]) {
        await run(commands[gitCmd], args.slice(1));
        return;
      }
    }

    if (commands[cmd]) {
      await run(commands[cmd], args);
    } else {
      term.writeln(`unknown command: ${cmd} — type \`help\` for a list`);
      prompt();
    }
  }

  async function run(command, args) {
    try {
      await command.fn(args);
    } catch (e) {
      term.writeln(`\x1b[31merror: ${e.message || e}\x1b[0m`);
    }
    prompt();
  }

  return { prompt };
}

// ── commands ─────────────────────────────────────────────

function buildCommands(ctx, term, confirm, getCwd, setCwd) {
  const { fs } = ctx;

  function resolve(p) {
    const cwd = getCwd();
    if (p.startsWith("/")) return normalize(p);
    return normalize(cwd === "/" ? `/${p}` : `${cwd}/${p}`);
  }

  function normalize(p) {
    const parts = p.split("/").filter(Boolean);
    const resolved = [];
    for (const part of parts) {
      if (part === "..") resolved.pop();
      else if (part !== ".") resolved.push(part);
    }
    return "/" + resolved.join("/");
  }

  function writeMulti(text) {
    for (const line of text.split("\n")) {
      term.writeln(line);
    }
  }

  const commands = {
    help: {
      desc: "list commands",
      fn() {
        const entries = Object.entries(commands).sort((a, b) =>
          a[0].localeCompare(b[0]),
        );
        for (const [name, cmd] of entries) {
          term.writeln(`  ${name.padEnd(16)} ${cmd.desc}`);
        }
      },
    },

    exit: {
      desc: "reload and return to app",
      fn() {
        location.reload();
      },
    },

    ls: {
      desc: "list directory [path]",
      async fn(args) {
        const target = args[0] ? resolve(args[0]) : getCwd();
        const entries = await fs.promises.readdir(target);
        for (const entry of entries) {
          const full = target === "/" ? `/${entry}` : `${target}/${entry}`;
          try {
            const stat = await fs.promises.stat(full);
            if (stat.type === "dir") {
              term.writeln(`\x1b[34m${entry}/\x1b[0m`);
            } else {
              const size = stat.size != null ? `  ${stat.size}B` : "";
              term.writeln(`${entry}${size}`);
            }
          } catch {
            term.writeln(entry);
          }
        }
      },
    },

    cd: {
      desc: "change directory [path]",
      async fn(args) {
        const target = args[0] ? resolve(args[0]) : "/";
        try {
          const stat = await fs.promises.stat(target);
          if (stat.type !== "dir") {
            term.writeln(`not a directory: ${target}`);
            return;
          }
          setCwd(target);
        } catch {
          term.writeln(`no such directory: ${target}`);
        }
      },
    },

    pwd: {
      desc: "print working directory",
      fn() {
        term.writeln(getCwd());
      },
    },

    cat: {
      desc: "show file contents",
      async fn(args) {
        if (!args[0]) {
          term.writeln("usage: cat <file>");
          return;
        }
        const target = resolve(args[0]);
        const content = await fs.promises.readFile(target, "utf8");
        writeMulti(content);
      },
    },

    stat: {
      desc: "show file/dir metadata",
      async fn(args) {
        if (!args[0]) {
          term.writeln("usage: stat <path>");
          return;
        }
        const target = resolve(args[0]);
        const s = await fs.promises.stat(target);
        writeMulti(JSON.stringify(s, null, 2));
      },
    },

    "git log": {
      desc: "show commit log [--depth N]",
      async fn(args) {
        let depth = 10;
        const di = args.indexOf("--depth");
        if (di !== -1 && args[di + 1]) {
          depth = parseInt(args[di + 1], 10) || 10;
        }
        const dir = getCwd();
        const commits = await git.log({ fs, dir, depth });
        for (const c of commits) {
          const short = c.oid.slice(0, 7);
          const date = new Date(c.commit.committer.timestamp * 1000)
            .toISOString()
            .slice(0, 10);
          term.writeln(
            `\x1b[33m${short}\x1b[0m ${date} ${c.commit.message.split("\n")[0]}`,
          );
        }
      },
    },

    "git status": {
      desc: "show working tree status",
      async fn() {
        const dir = getCwd();
        const matrix = await git.statusMatrix({ fs, dir });
        let clean = true;
        for (const [filepath, head, workdir, stage] of matrix) {
          if (head !== 1 || workdir !== 1 || stage !== 1) {
            clean = false;
            let status = "modified";
            if (head === 0 && workdir === 2) status = "new";
            if (head === 1 && workdir === 0) status = "deleted";
            term.writeln(`  ${status.padEnd(10)} ${filepath}`);
          }
        }
        if (clean) term.writeln("working tree clean");
      },
    },

    "git branch": {
      desc: "list branches",
      async fn() {
        const dir = getCwd();
        const branches = await git.listBranches({ fs, dir });
        const current = await git.currentBranch({ fs, dir });
        for (const b of branches) {
          const marker = b === current ? "* " : "  ";
          term.writeln(`${marker}${b}`);
        }
      },
    },

    "git remote": {
      desc: "list remotes",
      async fn() {
        const dir = getCwd();
        const remotes = await git.listRemotes({ fs, dir });
        for (const r of remotes) {
          term.writeln(`${r.remote}\t${r.url}`);
        }
      },
    },

    idb: {
      desc: "list IndexedDB databases and stores",
      async fn() {
        if (!indexedDB.databases) {
          term.writeln("indexedDB.databases() not supported");
          return;
        }
        const databases = await indexedDB.databases();
        if (databases.length === 0) {
          term.writeln("no databases");
          return;
        }
        for (const dbInfo of databases) {
          term.writeln(`\x1b[36m${dbInfo.name}\x1b[0m (v${dbInfo.version})`);
          try {
            const db = await idbOpen(dbInfo.name, dbInfo.version);
            const stores = Array.from(db.objectStoreNames);
            for (const storeName of stores) {
              try {
                const count = await idbCount(db, storeName);
                term.writeln(`  └ ${storeName} (${count} entries)`);
              } catch {
                term.writeln(`  └ ${storeName} (cannot read)`);
              }
            }
            db.close();
          } catch (e) {
            term.writeln(`  └ cannot open: ${e.message}`);
          }
        }
      },
    },

    logs: {
      desc: "show captured console logs [N]",
      fn(args) {
        const count = parseInt(args[0], 10) || 50;
        const slice = logs.slice(-count);
        if (slice.length === 0) {
          term.writeln("no logs captured");
          return;
        }
        for (const entry of slice) {
          const time = new Date(entry.time).toLocaleTimeString();
          const color =
            entry.level === "error"
              ? "\x1b[31m"
              : entry.level === "warn"
                ? "\x1b[33m"
                : "";
          const reset = color ? "\x1b[0m" : "";
          term.writeln(
            `${color}[${time}] ${entry.level}: ${entry.message}${reset}`,
          );
        }
      },
    },

    state: {
      desc: "show app state",
      fn() {
        term.writeln(`mind:  ${ctx.state.mind}`);
        term.writeln(
          `api:   ${ctx.state.apiReady ? "ready" : "not initialized"}`,
        );
        term.writeln(
          `error: ${ctx.state.error ? ctx.state.error.message || String(ctx.state.error) : "none"}`,
        );
        term.writeln(
          `build: ${window.__TAURI_INTERNALS__ ? "tauri" : "browser"}`,
        );
      },
    },

    rm: {
      desc: "delete a file (with confirmation)",
      fn(args) {
        if (!args[0]) {
          term.writeln("usage: rm <path>");
          return;
        }
        const target = resolve(args[0]);
        confirm(`delete ${target}?`, async () => {
          await fs.promises.unlink(target);
          term.writeln(`deleted ${target}`);
        });
      },
    },

    wipe: {
      desc: "delete an IndexedDB database (with confirmation)",
      fn(args) {
        if (!args[0]) {
          term.writeln("usage: wipe <database-name>  or  wipe --all");
          return;
        }
        if (args[0] === "--all") {
          confirm("wipe ALL databases and reload?", async () => {
            try {
              const dbs = await indexedDB.databases();
              for (const db of dbs) indexedDB.deleteDatabase(db.name);
            } catch {
              indexedDB.deleteDatabase("fs");
            }
            location.reload();
          });
        } else {
          const name = args[0];
          confirm(`wipe database "${name}" and reload?`, () => {
            indexedDB.deleteDatabase(name);
            location.reload();
          });
        }
      },
    },
  };

  return commands;
}

// ── idb helpers ──────────────────────────────────────────

function idbOpen(name, version) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbCount(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
