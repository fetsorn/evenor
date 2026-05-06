export function initFS(fs) {
  function createReadStream(filepath) {
    return new ReadableStream({
      async start(controller) {
        const contents = await fs.promises.readFile(filepath);

        controller.enqueue(contents);

        controller.close();
      },
    });
  }

  function createWriteStream(filepath) {
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

  async function mkdtemp(filepath) {
    // SEC-14: use crypto for unpredictable temp dir names
    const randomString = crypto
      .getRandomValues(new Uint32Array(1))[0]
      .toString(36);

    const tmpdir = filepath + randomString;

    try {
      await fs.promises.mkdir(tmpdir);
    } catch {
      // do nothing
    }

    return tmpdir;
  }

  function mkdtempSync(filepath) {
    // SEC-14: use crypto for unpredictable temp dir names
    const randomString = crypto
      .getRandomValues(new Uint32Array(1))[0]
      .toString(36);

    const tmpdir = filepath + randomString;

    try {
      fs.mkdir(tmpdir);
    } catch {
      // do nothing
    }

    return tmpdir;
  }

  async function appendFile(filepath, tail) {
    try {
      const contents = await fs.promises.readFile(filepath, "utf8");

      const contentsNew = contents + tail;

      await fs.promises.writeFile(filepath, contentsNew);
    } catch {
      await fs.promises.writeFile(filepath, tail);
    }
  }

  async function rm(path, opts) {
    const { type } = await fs.promises.stat(path);

    if (type === "file") {
      await fs.promises.unlink(path);
    } else if (type === "dir") {
      if (opts.recursive) {
        const files = await fs.promises.readdir(path);

        for (const file of files) {
          const filepath = `${path}/${file}`;

          await rm(filepath, opts);
        }
      }

      await fs.promises.rmdir(path);
    }
  }

  return {
    createReadStream,
    createWriteStream,
    mkdtempSync,
    ...fs,
    promises: {
      mkdtemp,
      appendFile,
      rm,
      ...fs.promises,
    },
  };
}
