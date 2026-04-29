import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import {
  fs,
  createReadStream,
  createWriteStream,
  mkdtemp,
  appendFile,
} from "@/api/browser/lightningfs.js";
import stub from "./stub.js";

describe("createReadStream", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("reads file", async () => {
    await fs.promises.mkdir(stub.dirpath);

    // create file
    await fs.promises.writeFile(stub.filepath, stub.content);

    // consume the stream to string
    const strm = createReadStream(stub.filepath);

    let content = "";

    await strm.pipeTo(
      new WritableStream({
        write(character) {
          content += character;
        },
      }),
    );

    // check that string equals contents
    expect(content).toBe(stub.content);
  });
});

describe("createWriteStream", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("writes file", async () => {
    await fs.promises.mkdir(stub.dirpath);

    // create a read stream from string
    const strm = ReadableStream.from(stub.content);

    // pipe to the write stream
    await strm.pipeTo(createWriteStream(stub.filepath));

    // read file
    const content = await fs.promises.readFile(stub.filepath, "utf8");

    // check that contents equal string
    expect(content).toBe(stub.content);
  });
});

describe("mkdtemp", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("creates a directory", async () => {
    // mock math.random
    Math.random = vi.fn(() => 0.0001);

    await mkdtemp("/");

    const listing = await fs.promises.readdir("/");

    // check that tmpdir is created
    expect(listing).toEqual(["1"]);
  });
});

describe("appendFile", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("writes to the file", async () => {
    await fs.promises.mkdir(stub.dirpath);

    // create file
    await fs.promises.writeFile(stub.filepath, stub.content);

    const content = await fs.promises.readFile(stub.filepath, "utf8");

    // check file contents
    expect(content).toBe(stub.content);

    // append
    await appendFile(stub.filepath, "-");

    const contentNew = await fs.promises.readFile(stub.filepath, "utf8");

    // check file contents
    expect(contentNew).toBe(`${stub.content}-`);
  });
});
