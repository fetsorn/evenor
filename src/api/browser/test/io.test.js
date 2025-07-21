import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import {
  findMind,
  fetchFile,
  readFile,
  writeFile,
  rimraf,
  ls,
  pickFile,
} from "@/api/browser/io.js";
import { fs } from "@/api/browser/lightningfs.js";
import stub from "./stub.js";

describe("findMind", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind is found", async () => {
    await expect(findMind(stub.mind)).rejects.toThrowError();
  });

  test("finds the directory", async () => {
    await fs.promises.mkdir(stub.dirpath);

    const dir = await findMind(stub.mind);

    expect(dir).toBe(stub.dirpath);
  });
});

describe("fetchFile", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(fetchFile(stub.mind, stub.filename)).rejects.toThrowError();
  });

  test("reads file", async () => {
    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.writeFile(stub.filepath, stub.content);

    const content = await fetchFile(stub.mind, stub.filename);

    // stringify to get rmind of prototype methods on Uint8Array
    expect(JSON.stringify(content)).toEqual(JSON.stringify(stub.encoded));
  });

  test("reads file recursive", async () => {
    const absoluteDir = `${stub.dirpath}${stub.dirpath}`;

    const relativeDir = stub.dir;

    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.mkdir(absoluteDir);

    const absoluteFile = `${absoluteDir}/${stub.filename}`;

    const relativeFile = `${relativeDir}/${stub.filename}`;

    await fs.promises.writeFile(absoluteFile, stub.content);

    const content = await fetchFile(stub.mind, relativeFile);

    // stringify to get rmind of prototype methods on Uint8Array
    expect(JSON.stringify(content)).toEqual(JSON.stringify(stub.encoded));
  });
});

describe("readFile", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(readFile(stub.mind, stub.filename)).rejects.toThrowError();
  });

  test("reads file", async () => {
    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.writeFile(stub.filepath, stub.content);

    const content = await readFile(stub.mind, stub.filename);

    expect(content).toEqual(stub.content);
  });

  test("reads file recursive", async () => {
    const absoluteDir = `${stub.dirpath}${stub.dirpath}`;

    const relativeDir = stub.dir;

    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.mkdir(absoluteDir);

    const absoluteFile = `${absoluteDir}/${stub.filename}`;

    const relativeFile = `${relativeDir}/${stub.filename}`;

    await fs.promises.writeFile(absoluteFile, stub.content);

    const content = await readFile(stub.mind, relativeFile);

    expect(content).toEqual(stub.content);
  });
});

describe("writeFile", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(
      writeFile(stub.mind, stub.filename, stub.content),
    ).rejects.toThrowError();
  });

  test("writes file", async () => {
    await fs.promises.mkdir(stub.dirpath);

    await writeFile(stub.mind, stub.filename, stub.content);

    const content = await fs.promises.readFile(stub.filepath, "utf8");

    expect(content).toEqual(stub.content);
  });

  test("writes file recursive", async () => {
    const absoluteDir = `${stub.dirpath}${stub.dirpath}`;

    const relativeDir = stub.dir;

    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.mkdir(absoluteDir);

    const absoluteFile = `${absoluteDir}/${stub.filename}`;

    const relativeFile = `${relativeDir}/${stub.filename}`;

    await writeFile(stub.mind, relativeFile, stub.content);

    const content = await fs.promises.readFile(absoluteFile, "utf8");

    expect(content).toEqual(stub.content);
  });
});

describe("rimraf", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("removes a directory", async () => {
    const absoluteDir = `${stub.dirpath}${stub.dirpath}`;

    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.mkdir(absoluteDir);

    const absoluteFile = `${absoluteDir}/${stub.filename}`;

    await fs.promises.writeFile(absoluteFile, stub.content);

    await rimraf(stub.dirpath);

    const listing = await fs.promises.readdir("/");

    expect(listing).toEqual([]);
  });
});

describe("ls", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("find a directory", async () => {
    const absoluteDir = `${stub.dirpath}${stub.dirpath}`;

    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.mkdir(absoluteDir);

    const absoluteFile = `${absoluteDir}/${stub.filename}`;

    await fs.promises.writeFile(absoluteFile, stub.content);

    const listing = await ls("/");

    expect(listing).toEqual(`list /: ${stub.dir}
list //${stub.dir}: ${stub.dir}
list //${stub.dir}/${stub.dir}: ${stub.filename}
`);
  });
});

describe("pickFile", () => {
  test("find a directory", async () => {
    const input = document.createElement("input");

    document.createElement = vi.fn(() => input);

    setTimeout(() => input.onchange({ target: { files: [stub.file] } }), 50);

    const files = await pickFile();

    expect(document.createElement).toHaveBeenCalledWith("input");

    expect(files).toEqual([stub.file]);
  });
});
