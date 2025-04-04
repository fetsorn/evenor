import { expect, test, describe, beforeAll, vi } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { fs } from "./lightningfs.js";
import browser from "./index.js";
import {
  createRepo,
  commit,
  clone,
  pull,
  push,
  listRemotes,
  addRemote,
  getRemote,
} from "./git.js";
import stub from "./stub.js";

vi.mock("./io.js", async (importOriginal) => {
  const mod = await importOriginal();

  const findDir = vi.fn(async (uuid) => {
    expect(uuid).toBe(stub.uuid);

    return stub.dir;
  });

  return {
    ...mod,
    findDir,
  };
});

describe("createRepo", () => {
  test("creates a directory", async () => {
    fs.init("test", { wipe: true });

    await createRepo(stub.uuid, stub.name);

    const listing = await fs.promises.readdir("/");

    expect(listing).toEqual([stub.dir]);

    const gitignore = await fs.promises.readFile(
      `/${stub.dir}/.gitignore`,
      "utf8",
    );

    expect(gitignore).toBe(".DS_Store");

    const dotcsvs = await fs.promises.readFile(
      `/${stub.dir}/.csvs.csv`,
      "utf8",
    );

    expect(dotcsvs).toBe("csvs,0.0.2");
  });

  test("creates root", async () => {
    fs.init("test", { wipe: true });

    await createRepo("root");

    const listing = await fs.promises.readdir("/");

    expect(listing).toEqual(["root"]);

    const gitignore = await fs.promises.readFile(`/root/.gitignore`, "utf8");

    expect(gitignore).toBe(".DS_Store");

    const dotcsvs = await fs.promises.readFile(`/root/.csvs.csv`, "utf8");

    expect(dotcsvs).toBe("csvs,0.0.2");
  });

  test("throws when root exists", async () => {
    fs.init("test", { wipe: true });

    await createRepo("root");

    await expect(createRepo("root")).rejects.toThrowError();
  });
});

//describe("clone", () => {
//  test("fetches", async () => {
//    expect(false).toBe(true);
//  });
//
//  test("writes remote", async () => {
//    expect(false).toBe(true);
//  });
//});
//
//describe("commit", () => {
//  test("adds", async () => {
//    expect(false).toBe(true);
//  });
//
//  test("creates message", async () => {
//    expect(false).toBe(true);
//  });
//
//  test("smudges lfs", async () => {
//    expect(false).toBe(true);
//  });
//});
//
//test("push", async () => {
//  // write test dataset
//  // push
//  // check remote git server
//  expect(false).toBe(true);
//});
//
//test("pull", async () => {
//  // write test dataset
//  // pull
//  // check git log
//  expect(false).toBe(true);
//});
//
//test("listRemotes", async () => {
//  // write test dataset
//  // list remotes
//  // check remotes
//  expect(false).toBe(true);
//});
//
//test("addRemote", async () => {
//  // write test dataset
//  // add remote
//  // check remotes
//  expect(false).toBe(true);
//});
//
//test("getRemote", async () => {
//  // write test dataset
//  // get remote
//  // check remote
//  expect(false).toBe(true);
//});
