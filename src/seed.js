import defaultMindFiles from "virtual:default-mind-files";

const MIND_DIR_NAME = "my-family";

/**
 * Seed the default mind into the store if no minds exist yet.
 *
 * Writes csvs files directly to the filesystem so that mindzoo's
 * catalog.rebuild() discovers the mind on init.
 *
 * @param {object} fs - filesystem with promises API (LightningFS or node:fs)
 * @param {string} dir - root store directory ("/" for browser, store path for tauri)
 * @returns {Promise<boolean>} true if seeded, false if store already had data
 */
export async function seedDefaultMind(fs, dir) {
  // check if any directories exist (besides "root" which rebuild creates)
  let entries;

  try {
    entries = await fs.promises.readdir(dir);
  } catch {
    entries = [];
  }

  const hasMinds = entries.some((e) => e !== "root");

  if (hasMinds) return false;

  const mindDir = `${dir}/${MIND_DIR_NAME}`;

  // create the mind root dir
  try {
    await fs.promises.mkdir(mindDir);
  } catch {
    // already exists
  }

  // collect all unique subdirectories we need to create
  const dirs = new Set();

  for (const relPath of Object.keys(defaultMindFiles)) {
    const parts = relPath.split("/");

    // build each intermediate directory path
    for (let i = 1; i <= parts.length - 1; i++) {
      dirs.add(parts.slice(0, i).join("/"));
    }
  }

  // create subdirectories (sorted ensures parents come first)
  for (const d of [...dirs].sort()) {
    try {
      await fs.promises.mkdir(`${mindDir}/${d}`);
    } catch {
      // already exists
    }
  }

  // write all files
  for (const [relPath, content] of Object.entries(defaultMindFiles)) {
    await fs.promises.writeFile(`${mindDir}/${relPath}`, content);
  }

  return true;
}
