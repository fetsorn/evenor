import "@/log-capture.js";
import LightningFS from "@isomorphic-git/lightning-fs";
import { initFS } from "@/fs.js";
import { onSevenTap } from "@/gesture.js";
import * as mindMode from "@/modes/mind.js";
import * as debugMode from "@/modes/debug.js";

export { newUUID } from "@/modes/mind.js";

export default async function startEvenor({ seed = true } = {}) {
  const fs = initFS(new LightningFS("fs"));

  const ctx = {
    fs,
    api: null,
    seed,
    state: {
      mind: "root",
      apiReady: false,
      error: null,
    },
  };

  const root = document.getElementById("root");

  const modes = { mind: mindMode, debug: debugMode };
  let current = null;
  let currentName = null;

  async function switchMode(name) {
    if (current) {
      current.unmount();
    }
    root.innerHTML = "";
    current = modes[name];
    currentName = name;
    await current.mount(root, ctx);
  }

  onSevenTap(() => {
    if (currentName === "debug") {
      // reload for a clean mind-mode reinit
      location.reload();
    } else {
      switchMode("debug");
    }
  });

  await switchMode("mind");
}
