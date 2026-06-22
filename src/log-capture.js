const MAX_ENTRIES = 500;

export const logs = [];

const _log = console.log;
const _warn = console.warn;
const _error = console.error;

function capture(level, args) {
  logs.push({
    time: Date.now(),
    level,
    message: args
      .map((a) => {
        try {
          return typeof a === "string" ? a : JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(" "),
  });
  if (logs.length > MAX_ENTRIES) logs.shift();
}

console.log = (...args) => {
  capture("log", args);
  _log.apply(console, args);
};
console.warn = (...args) => {
  capture("warn", args);
  _warn.apply(console, args);
};
console.error = (...args) => {
  capture("error", args);
  _error.apply(console, args);
};
