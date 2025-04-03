import LightningFS from "@isomorphic-git/lightning-fs";

export const fs = new LightningFS("fs");

export function createReadStream(filepath) {
  return new ReadableStream({
    async start(controller) {
      const contents = await fs.promises.readFile(filepath);

      controller.enqueue(contents);

      controller.close();
    },
  });
}

export function createWriteStream(filepath) {
  let contents = "";

  return new WritableStream({
    write(character) {
      contents += character;
    },

    async close() {
      await fs.promises.writeFile(filepath, contents);
    },
  });
}

export async function mkdtemp(filepath) {
  const randomString = Math.floor(Math.random() * 10000).toString();

  const tmpdir = filepath + randomString;

  try {
    await fs.promises.mkdir(tmpdir);
  } catch {
    // do nothing
  }

  return tmpdir;
}

export async function appendFile(filepath, tail) {
  try {
    const contents = await fs.promises.readFile(filepath, "utf8");

    const contentsNew = contents + tail;

    await fs.promises.writeFile(filepath, contentsNew);
  } catch {
    await fs.promises.writeFile(filepath, tail);
  }
}

fs.createReadStream = createReadStream;
fs.createWriteStream = createWriteStream;
fs.promises.mkdtemp = mkdtemp;
fs.promises.appendFile = appendFile;
