import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import { findDir, fetchFile, readFile, writeFile, rimraf, ls } from "./io.js";
import { fs } from "./lightningfs.js";
import stub from "./stub.js";

describe("findDir", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no repo is found", async () => {
    await expect(findDir(stub.uuid)).rejects.toThrowError();
  });

  test("finds the directory", async () => {
    await fs.promises.mkdir(stub.dirpath);

    const dir = await findDir(stub.uuid);

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

  test("throws if no repo", async () => {
    await expect(fetchFile(stub.uuid, stub.filename)).rejects.toThrowError();
  });

  test("reads file", async () => {
    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.writeFile(stub.filepath, stub.content);

    const content = await fetchFile(stub.uuid, stub.filename);

    const encoded = new TextEncoder().encode(stub.content);

    // stringify to get rid of prototype methods on Uint8Array
    expect(JSON.stringify(content)).toEqual(JSON.stringify(encoded));
  });

  test("reads file recursive", async () => {
    const absoluteDir = `${stub.dirpath}${stub.dirpath}`;

    const relativeDir = stub.dir;

    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.mkdir(absoluteDir);

    const absoluteFile = `${absoluteDir}/${stub.filename}`;

    const relativeFile = `${relativeDir}/${stub.filename}`;

    await fs.promises.writeFile(absoluteFile, stub.content);

    const content = await fetchFile(stub.uuid, relativeFile);

    const encoded = new TextEncoder().encode(stub.content);

    // stringify to get rid of prototype methods on Uint8Array
    expect(JSON.stringify(content)).toEqual(JSON.stringify(encoded));
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

  test("throws if no repo", async () => {
    await expect(readFile(stub.uuid, stub.filename)).rejects.toThrowError();
  });

  test("reads file", async () => {
    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.writeFile(stub.filepath, stub.content);

    const content = await readFile(stub.uuid, stub.filename);

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

    const content = await readFile(stub.uuid, relativeFile);

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

  test("throws if no repo", async () => {
    await expect(
      writeFile(stub.uuid, stub.filename, stub.content),
    ).rejects.toThrowError();
  });

  test("writes file", async () => {
    await fs.promises.mkdir(stub.dirpath);

    await writeFile(stub.uuid, stub.filename, stub.content);

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

    await writeFile(stub.uuid, relativeFile, stub.content);

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

    const relativeDir = stub.dir;

    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.mkdir(absoluteDir);

    const absoluteFile = `${absoluteDir}/${stub.filename}`;

    const relativeFile = `${relativeDir}/${stub.filename}`;

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

    const relativeDir = stub.dir;

    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.mkdir(absoluteDir);

    const absoluteFile = `${absoluteDir}/${stub.filename}`;

    const relativeFile = `${relativeDir}/${stub.filename}`;

    await fs.promises.writeFile(absoluteFile, stub.content);

    const listing = await ls("/");

    expect(listing).toEqual(`list /: a-e
list //a-e: a-e
list //a-e/a-e: h
`);
  });
});
